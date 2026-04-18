/**
 * services/orchestratorService.js
 * --------------------------------
 * The heart of the system — a LangChain ReAct Agent (AgentExecutor)
 * that uses an equipped set of tools to understand user chat messages
 * and decide whether to:
 *   1. Execute an on-chain action immediately (returns tx data for wallet)
 *   2. Schedule an autonomous background agent rule
 *   3. Query price / balance data
 *   4. List or manage existing agents
 */

const { ChatOpenAI } = require("@langchain/openai");
const { createToolCallingAgent } = require("langchain/agents");
const { AgentExecutor } = require("langchain/agents");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");

// Import all registered tools
const { transferTool, swapTool, checkBalanceTool } = require("../tools/blockchainTools");
const { createScheduledAgentTool, listAgentsTool, toggleAgentTool } = require("../tools/agentTools");
const { getPriceTool } = require("../tools/priceTools");
const { getMcpTools } = require("./mcpService");

// ----------------------------------------------------------------
// Orchestrator System Prompt
// ----------------------------------------------------------------
const SYSTEM_PROMPT = `You are Nexus, an intelligent on-chain AI agent assistant.
You help users manage their crypto wallet and automate blockchain tasks.
You are powered by the Model Context Protocol (MCP), allowing you to dynamically discover and use external office tools.

You have access to core tools that can:
- Transfer ETH
- Swap tokens
- Check balances and crypto prices
- Create autonomous "Scheduled Agents" for recurring or conditional tasks

Additionally, any tools you see with names like "Gmail", "Sheets", or custom n8n workflow names are dynamic automations provided via MCP.

IMPORTANT RULES:
1. If the user wants to do something NOW on the blockchain, use the core tools.
2. If the user wants to do something RECURRING or CONDITIONAL, use create_scheduled_agent.
3. If the user asks for email, document, or spreadsheet tasks, look for the corresponding MCP tools.
4. Always confirm actions.
5. User context is provided. Use {userId} and {walletAddress} when needed.

Current user context:
- User ID: {userId}
- Wallet Address: {walletAddress}`;

// ----------------------------------------------------------------
// Tool Registry (Base Tools)
// ----------------------------------------------------------------
const BASE_TOOLS = [
  transferTool,
  swapTool,
  checkBalanceTool,
  getPriceTool,
  createScheduledAgentTool,
  listAgentsTool,
  toggleAgentTool,
];

// ----------------------------------------------------------------
// Create Orchestrator Instance
// ----------------------------------------------------------------
let orchestratorExecutor = null;

const getOrchestrator = async () => {
  if (orchestratorExecutor) return orchestratorExecutor;

  // 1. Fetch Dynamic Tools from MCP (n8n)
  const mcpTools = await getMcpTools();
  const allTools = [...BASE_TOOLS, ...mcpTools];

  const llmModel = process.env.FEATHERLESS_MODEL || "meta-llama/Meta-Llama-3.1-8B-Instruct";
  const requestTimeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || "15000", 10);
  const maxRetries = parseInt(process.env.LLM_MAX_RETRIES || "1", 10);
  const providerApiKey = process.env.FEATHERLESS_API_KEY || process.env.OPENAI_API_KEY;
  const llm = new ChatOpenAI({
    model: llmModel,
    apiKey: providerApiKey,
    openAIApiKey: providerApiKey,
    baseURL: process.env.FEATHERLESS_BASE_URL || "https://api.featherless.ai/v1",
    configuration: {
      apiKey: providerApiKey,
      baseURL: process.env.FEATHERLESS_BASE_URL || "https://api.featherless.ai/v1",
    },
    temperature: 0,
    maxRetries,
    timeout: requestTimeoutMs,
  });

  // Create prompt correctly for ToolCallingAgent
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // Create the Tool Calling agent
  const agent = await createToolCallingAgent({
    llm,
    tools: allTools,
    prompt,
  });

  orchestratorExecutor = new AgentExecutor({
    agent,
    tools: allTools,
    verbose: process.env.NODE_ENV === "development",
    handleParsingErrors: true,
    returnIntermediateSteps: true,
  });

  console.log(`✅ Orchestrator (Nexus) initialized with ${allTools.length} total tools (${mcpTools.length} from MCP)`);
  return orchestratorExecutor;
};

// ----------------------------------------------------------------
// Main Chat Function — called by the chat controller
// ----------------------------------------------------------------
/**
 * @param {string} message - The user's natural language input
 * @param {string} userId - Firebase UID
 * @param {string} walletAddress - User's connected wallet address
 * @param {Array} chatHistory - Previous messages for context (optional)
 * @returns {object} - { response, transactionData? }
 */
const processChat = async (message, userId, walletAddress, chatHistory = []) => {
  // Deterministic answer for MCP tooling visibility to avoid LLM mis-summarization.
  if (/connected\s+n8n\s+tools|n8n\s+tools|connected\s+tools/i.test(message || "")) {
    const mcpTools = await getMcpTools();
    if (!mcpTools.length) {
      return {
        response: "No n8n MCP tools are currently connected.",
        transactionData: null,
      };
    }
    return {
      response: `Connected n8n tools: ${mcpTools.map((t) => t.name).join(", ")}`,
      transactionData: null,
    };
  }

  const executor = await getOrchestrator();

  const result = await executor.invoke({
    input: message,
    userId,
    walletAddress: walletAddress || "No wallet connected",
    chat_history: chatHistory,
  });

  // Parse the output to detect if there's a pending transaction
  let transactionData = null;
  try {
    // Check intermediate steps for tools that returned tx data
    if (result.intermediateSteps) {
      for (const step of result.intermediateSteps) {
        const toolOutput = JSON.parse(step.observation || "{}");
        if (toolOutput.status === "pending_signature" && toolOutput.transactionData) {
          transactionData = toolOutput.transactionData;
          break;
        }
      }
    }
  } catch (_) {
    // Observation wasn't JSON, that's fine
  }

  return {
    response: result.output,
    transactionData, // If not null, frontend should prompt user to sign
  };
};

module.exports = { processChat };
