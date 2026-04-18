/**
 * services/mcpService.js
 * ----------------------
 * Manages the connection to the n8n Instance-Level MCP Server.
 * Dynamically fetches tools and maps them to LangChain-compatible objects.
 */

const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");

let mcpClient = null;

const buildMcpUrlCandidates = (rawUrl) => {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return [];

  const candidates = new Set([trimmed]);
  const normalized = trimmed.replace(/\/+$/, "");
  if (normalized.endsWith("/http/sse")) {
    candidates.add(normalized.replace(/\/http\/sse$/, "/sse"));
  } else if (normalized.endsWith("/sse")) {
    candidates.add(normalized.replace(/\/sse$/, "/http/sse"));
  } else if (normalized.endsWith("/mcp-server")) {
    candidates.add(`${normalized}/sse`);
    candidates.add(`${normalized}/http/sse`);
  }

  try {
    const parsed = new URL(trimmed);
    const origin = parsed.origin;
    candidates.add(`${origin}/mcp-server/sse`);
    candidates.add(`${origin}/mcp-server/http/sse`);
    candidates.add(`${origin}/mcp/sse`);
    candidates.add(`${origin}/mcp/http/sse`);
  } catch (_) {
    // ignore parse errors and keep provided candidates only
  }
  return [...candidates];
};

/**
 * Initializes the MCP Client and connects to the n8n server.
 * Uses dynamic import for @modelcontextprotocol/sdk since it's an ESM package.
 */
const initializeMcpClient = async () => {
  if (mcpClient) return mcpClient;

  // Dynamically import ESM modules
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StreamableHTTPClientTransport } = await import("@modelcontextprotocol/sdk/client/streamableHttp.js");
  const { SSEClientTransport } = await import("@modelcontextprotocol/sdk/client/sse.js");

  const configuredServerUrl = process.env.N8N_MCP_SERVER_URL;
  const token = process.env.N8N_MCP_TOKEN;

  if (!configuredServerUrl || !token) {
    console.warn("⚠️ MCP Service: N8N_MCP_SERVER_URL or N8N_MCP_TOKEN missing. MCP tools will be disabled.");
    return null;
  }

  const urlCandidates = buildMcpUrlCandidates(configuredServerUrl);
  let lastError = null;

  for (const serverUrl of urlCandidates) {
    try {
      console.log(`🔌 Attempting MCP connection to: ${serverUrl}`);
      const commonHeaders = {
        Authorization: `Bearer ${token}`,
        "x-mcp-api-key": token,
      };
      const endpointUrl = new URL(serverUrl);

      // Instance-level n8n MCP endpoint (/mcp-server/http) is streamable HTTP.
      // MCP Trigger URLs usually use SSE at .../sse.
      const preferredTransport = endpointUrl.pathname.includes("/mcp-server/http")
        ? "streamable-http"
        : "sse";

      const transports =
        preferredTransport === "streamable-http"
          ? [
              {
                name: "streamable-http",
                create: () =>
                  new StreamableHTTPClientTransport(endpointUrl, {
                    requestInit: { headers: commonHeaders },
                  }),
              },
              {
                name: "sse",
                create: () =>
                  new SSEClientTransport(endpointUrl, {
                    eventSourceInit: { headers: commonHeaders },
                    requestInit: { headers: commonHeaders },
                  }),
              },
            ]
          : [
              {
                name: "sse",
                create: () =>
                  new SSEClientTransport(endpointUrl, {
                    eventSourceInit: { headers: commonHeaders },
                    requestInit: { headers: commonHeaders },
                  }),
              },
              {
                name: "streamable-http",
                create: () =>
                  new StreamableHTTPClientTransport(endpointUrl, {
                    requestInit: { headers: commonHeaders },
                  }),
              },
            ];

      for (const transportSpec of transports) {
        try {
          const client = new Client(
            { name: "DevClash-Nexus-Client", version: "1.0.0" },
            { capabilities: {} }
          );
          await client.connect(transportSpec.create());
          console.log(`📡 MCP Client connected successfully to n8n at ${serverUrl} via ${transportSpec.name}`);
          mcpClient = client;
          return mcpClient;
        } catch (transportError) {
          lastError = transportError;
          console.error(`❌ MCP ${transportSpec.name} transport failed at [${serverUrl}]:`, transportError.message);
        }
      }
    } catch (error) {
      lastError = error;
      console.error(`❌ MCP Connection Error at [${serverUrl}]:`, error.message);
    }
  }

  if (lastError?.message?.includes("404")) {
    console.warn("👉 Suggestion: Verify your n8n 'MCP Server Trigger' workflow is active and the endpoint path (usually /sse) is correct.");
  }
  return null;
};

/**
 * Fetches all tools from n8n and wraps them in LangChain tools.
 */
const getMcpTools = async () => {
  const client = await initializeMcpClient();
  if (!client) return [];

  try {
    const { tools } = await client.listTools();
    console.log(`🔍 Discovered ${tools.length} tools from n8n MCP Server`);

    return tools.map((mcpTool) => {
      // n8n MCP returns JSON schema; keep a permissive zod schema for LangChain.
      const schema = z.object({}).passthrough();
      // Create a LangChain tool for each MCP tool
      return new DynamicStructuredTool({
        name: mcpTool.name,
        description: mcpTool.description || `Automation tool: ${mcpTool.name}`,
        schema,
        func: async (input) => {
          console.log(`🤖 Executing MCP Tool [${mcpTool.name}] with input:`, input);
          try {
            const result = await client.callTool({
              name: mcpTool.name,
              arguments: input,
            });
            return JSON.stringify(result);
          } catch (err) {
            return JSON.stringify({ status: "error", message: err.message });
          }
        },
      });
    });
  } catch (error) {
    console.error("❌ Failed to list MCP tools:", error.message);
    return [];
  }
};

module.exports = { getMcpTools, initializeMcpClient };
