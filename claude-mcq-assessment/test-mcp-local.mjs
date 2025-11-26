import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function testMCPConnection() {
  const serverUrl = process.argv[2] || "http://localhost:3456/sse";
  console.log(`🔌 Connecting to MCP server at ${serverUrl}...`);

  const transport = new SSEClientTransport(new URL(serverUrl));

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
    console.log("Available tools:");
    tools.tools.forEach(t => {
      console.log(`  - ${t.name}: ${t.description}`);
    });

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
    if (result.content && result.content[0]) {
      const mcq = JSON.parse(result.content[0].text);
      console.log(`  Topic: ${mcq.topic}`);
      console.log(`  Difficulty: ${mcq.difficulty}`);
      console.log(`  Question: ${mcq.stem}`);
      console.log(`  Options:`);
      mcq.options.forEach(o => console.log(`    ${o.id}. ${o.text}`));
      console.log(`  Correct: ${mcq.correct}`);
    }

    await mcpClient.close();
    console.log("\n🔌 Connection closed.");
    console.log("\n✅ All tests passed! MCP SSE client is working correctly.");

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    process.exit(1);
  }
}

testMCPConnection();
