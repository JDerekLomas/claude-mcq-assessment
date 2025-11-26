import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function testMCPConnection() {
  console.log("🔌 Connecting to MCP server at mcqmcp.onrender.com...");

  const transport = new SSEClientTransport(
    new URL("https://mcqmcp.onrender.com/sse")
  );

  const mcpClient = new Client({
    name: "test-client",
    version: "1.0.0"
  });

  try {
    await mcpClient.connect(transport);
    console.log("✅ Connected successfully!\n");

    // List available tools
    console.log("📋 Listing available tools...");
    const tools = await mcpClient.listTools();
    console.log("Available tools:", JSON.stringify(tools, null, 2));

    // Try to generate a question
    console.log("\n🎯 Testing mcq_generate tool...");
    const result = await mcpClient.callTool({
      name: "mcq_generate",
      arguments: {
        user_id: "test-user-123",
        objective: "Understanding React hooks",
        difficulty: "medium"
      }
    });

    console.log("\n✅ MCQ Generated:");
    console.log(JSON.stringify(result, null, 2));

    await mcpClient.close();
    console.log("\n🔌 Connection closed.");

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    process.exit(1);
  }
}

testMCPConnection();
