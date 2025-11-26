import http from "http";

// Simple mock MCP server with SSE transport
const PORT = 3456;

const tools = [
  {
    name: "mcq_generate",
    description: "Generate a multiple choice question",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        objective: { type: "string" },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
      },
      required: ["user_id", "objective"]
    }
  }
];

const clients = new Map();

function sendSSEEvent(res, event, data) {
  // For endpoint event, data should be plain string URL, not JSON
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  res.write(`event: ${event}\ndata: ${dataStr}\n\n`);
}

function sendSSEMessage(res, data) {
  res.write(`event: message\ndata: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  console.log(`${req.method} ${url.pathname}`);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // SSE endpoint
  if (url.pathname === "/sse" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    const clientId = Date.now().toString();
    clients.set(clientId, res);

    // Send endpoint event - this tells the client where to POST messages
    const endpointUrl = `http://localhost:${PORT}/message?sessionId=${clientId}`;
    sendSSEEvent(res, "endpoint", endpointUrl);

    req.on("close", () => {
      clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    });

    console.log(`Client ${clientId} connected, endpoint: ${endpointUrl}`);
    return;
  }

  // Message endpoint for JSON-RPC
  if (url.pathname === "/message" && req.method === "POST") {
    const sessionId = url.searchParams.get("sessionId");
    const clientRes = clients.get(sessionId);

    if (!clientRes) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const message = JSON.parse(body);
        console.log("📥 Received:", message.method || "response", message.id ? `(id: ${message.id})` : "");

        let response;

        // Handle different JSON-RPC methods
        if (message.method === "initialize") {
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: { tools: {} },
              serverInfo: { name: "mock-mcq-server", version: "1.0.0" }
            }
          };
        } else if (message.method === "tools/list") {
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: { tools }
          };
        } else if (message.method === "tools/call") {
          const { name, arguments: args } = message.params;

          if (name === "mcq_generate") {
            // Generate a mock MCQ
            const mcq = {
              id: `generated-${Date.now()}`,
              topic: args.objective,
              difficulty: args.difficulty || "medium",
              stem: `What is a key concept in ${args.objective}?`,
              options: [
                { id: "A", text: "Correct answer about " + args.objective },
                { id: "B", text: "Plausible but incorrect option" },
                { id: "C", text: "Another distractor" },
                { id: "D", text: "Common misconception" }
              ],
              correct: "A",
              feedback: {
                correct: "Well done!",
                incorrect: "Not quite, review the concept.",
                explanation: `This tests understanding of ${args.objective}.`
              }
            };

            response = {
              jsonrpc: "2.0",
              id: message.id,
              result: {
                content: [{ type: "text", text: JSON.stringify(mcq, null, 2) }]
              }
            };
            console.log("📤 Generated MCQ for:", args.objective);
          } else {
            response = {
              jsonrpc: "2.0",
              id: message.id,
              error: { code: -32601, message: `Unknown tool: ${name}` }
            };
          }
        } else if (message.method === "notifications/initialized") {
          // No response needed for notifications
          console.log("📤 Client initialized");
          res.writeHead(202);
          res.end();
          return;
        } else {
          response = {
            jsonrpc: "2.0",
            id: message.id,
            error: { code: -32601, message: `Method not found: ${message.method}` }
          };
        }

        // Send response via SSE message event
        if (response) {
          console.log("📤 Sending response for:", message.method, `(id: ${message.id})`);
          sendSSEMessage(clientRes, response);
        }

        res.writeHead(202);
        res.end();
      } catch (err) {
        console.error("Error:", err);
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`🚀 Mock MCP server running at http://localhost:${PORT}/sse`);
  console.log("Press Ctrl+C to stop\n");
});
