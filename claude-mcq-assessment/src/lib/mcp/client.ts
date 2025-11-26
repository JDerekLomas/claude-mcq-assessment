import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "https://mcqmcp.onrender.com/sse";

let mcpClient: Client | null = null;
let connectionPromise: Promise<Client> | null = null;

/**
 * Get or create a connected MCP client.
 * Uses singleton pattern to maintain connection across requests.
 */
export async function getMCPClient(): Promise<Client> {
  // If we have a connected client, return it
  if (mcpClient) {
    return mcpClient;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Start new connection
  connectionPromise = connectMCP();

  try {
    mcpClient = await connectionPromise;
    return mcpClient;
  } finally {
    connectionPromise = null;
  }
}

async function connectMCP(): Promise<Client> {
  console.log(`[MCP] Connecting to ${MCP_SERVER_URL}...`);

  const transport = new SSEClientTransport(new URL(MCP_SERVER_URL));

  const client = new Client({
    name: "claude-mcq-assessment",
    version: "1.0.0"
  });

  await client.connect(transport);
  console.log("[MCP] Connected successfully");

  return client;
}

/**
 * Disconnect the MCP client.
 */
export async function disconnectMCP(): Promise<void> {
  if (mcpClient) {
    await mcpClient.close();
    mcpClient = null;
    console.log("[MCP] Disconnected");
  }
}

/**
 * Call a tool on the remote MCP server.
 */
export async function callMCPTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ success: true; data: unknown } | { success: false; error: string }> {
  try {
    const client = await getMCPClient();

    const result = await client.callTool({
      name,
      arguments: args
    });

    // Parse the result content
    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      const firstContent = result.content[0];
      if (firstContent.type === "text") {
        try {
          const data = JSON.parse(firstContent.text);
          return { success: true, data };
        } catch {
          return { success: true, data: firstContent.text };
        }
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("[MCP] Tool call error:", error);

    // Reset client on connection errors to allow reconnection
    if (error instanceof Error && error.message.includes("connect")) {
      mcpClient = null;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown MCP error"
    };
  }
}

/**
 * List available tools from the MCP server.
 */
export async function listMCPTools(): Promise<{ name: string; description: string }[]> {
  try {
    const client = await getMCPClient();
    const result = await client.listTools();
    return result.tools.map(t => ({
      name: t.name,
      description: t.description || ""
    }));
  } catch (error) {
    console.error("[MCP] List tools error:", error);
    return [];
  }
}

/**
 * Tool definition for Anthropic API - mcq_generate
 */
export const mcqGenerateToolDefinition = {
  name: "mcq_generate",
  description: "Generate a multiple choice question based on a learning objective. Use this when you need to create a new question for a topic not in the item bank.",
  input_schema: {
    type: "object" as const,
    properties: {
      user_id: {
        type: "string",
        description: "The user's ID for personalization"
      },
      objective: {
        type: "string",
        description: "The learning objective or topic for the question"
      },
      difficulty: {
        type: "string",
        enum: ["easy", "medium", "hard"],
        description: "The difficulty level of the question"
      }
    },
    required: ["user_id", "objective"]
  }
};
