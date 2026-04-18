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

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { createToolCallingAgent } = require("langchain/agents");
const { AgentExecutor } = require("langchain/agents");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");

// Import all registered tools
const { transferTool, swapTool, checkBalanceTool } = require("../tools/blockchainTools");
const { createScheduledAgentTool, listAgentsTool, toggleAgentTool } = require("../tools/agentTools");
const { getPriceTool } = require("../tools/priceTools");

// ----------------------------------------------------------------
// Orchestrator System Prompt
// ----------------------------------------------------------------
const SYSTEM_PROMPT = `You are Nexus, an intelligent on-chain AI agent assistant.
You help users manage their crypto wallet and automate blockchain tasks.

You have access to tools that can:
- Transfer ETH
- Swap tokens
- Check balances and crypto prices
- Create autonomous "Scheduled Agents" for recurring or conditional tasks

IMPORTANT RULES:
1. If the user wants to do something NOW, use the immediate tools.
2. If the user wants to do something RECURRING or CONDITIONAL, use create_scheduled_agent.
3. Always confirm actions.
4. User context is provided. Use {userId} and {walletAddress} when needed.

Current user context:
- User ID: {userId}
- Wallet Address: {walletAddress}`;

// ----------------------------------------------------------------
// Tool Registry
// ----------------------------------------------------------------
const ALL_TOOLS = [
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

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0,
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
    tools: ALL_TOOLS,
    prompt,
  });

  orchestratorExecutor = new AgentExecutor({
    agent,
    tools: ALL_TOOLS,
    verbose: process.env.NODE_ENV === "development",
    handleParsingErrors: true,
    returnIntermediateSteps: true,
  });

  console.log("✅ Orchestrator (Nexus) initialized with Tool Calling");
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
