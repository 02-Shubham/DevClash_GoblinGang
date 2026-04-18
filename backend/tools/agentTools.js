/**
 * tools/agentTools.js
 * -------------------
 * LangChain-compatible tools for managing autonomous agent rules.
 * These tools read/write to Firestore to schedule or list agents.
 */

const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { db } = require("../firebaseAdmin");

// ----------------------------------------------------------------
// Tool: Create a Scheduled / Autonomous Agent
// ----------------------------------------------------------------
const createScheduledAgentTool = tool(
  async ({ userId, name, triggerType, condition, conditionValue, actionType, actionParams }) => {
    try {
      const agentData = {
        userId,
        name,
        type: "autonomous",
        isSystemDefault: false,
        status: "active",
        rule: {
          trigger: {
            type: triggerType,       // "time" | "price"
            condition,               // ">" | "<" | "==" | "every"
            value: conditionValue,   // e.g. "3000" for price, "24h" for time
          },
          action: {
            type: actionType,        // "transfer" | "swap"
            params: actionParams,    // { toAddress, amount, fromToken, toToken }
          },
        },
        lastRun: null,
        createdAt: new Date().toISOString(),
      };

      const docRef = await db.collection("agents").add(agentData);

      return JSON.stringify({
        status: "success",
        agentId: docRef.id,
        message: `Autonomous agent "${name}" has been created and is now active.`,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "create_scheduled_agent",
    description:
      "Creates an autonomous agent that will automatically execute on-chain actions " +
      "based on a trigger condition (time-based or price-based). " +
      "Use this when the user says 'every day', 'when price reaches', 'automatically', " +
      "'schedule', or any recurring/conditional future action.",
    schema: z.object({
      userId: z.string().describe("The Firebase UID of the user"),
      name: z.string().describe("A short, descriptive name for this agent (e.g. 'Daily ETH Transfer')"),
      triggerType: z.enum(["time", "price"]).describe("Whether trigger is time-based or price-based"),
      condition: z
        .string()
        .describe("The comparison operator: '>', '<', '==', or 'every' for recurring time"),
      conditionValue: z
        .string()
        .describe("The value of the condition (e.g. '3000' for price, '24h' for time interval)"),
      actionType: z
        .enum(["transfer", "swap"])
        .describe("The action to take when the condition is met"),
      actionParams: z
        .record(z.string())
        .describe(
          "Action parameters object (e.g. { toAddress, amount } for transfer, " +
            "{ fromToken, toToken, amount } for swap)"
        ),
    }),
  }
);

// ----------------------------------------------------------------
// Tool: List User's Autonomous Agents
// ----------------------------------------------------------------
const listAgentsTool = tool(
  async ({ userId }) => {
    try {
      const snapshot = await db
        .collection("agents")
        .where("userId", "==", userId)
        .where("type", "==", "autonomous")
        .get();

      if (snapshot.empty) {
        return JSON.stringify({
          status: "success",
          agents: [],
          message: "You have no autonomous agents running.",
        });
      }

      const agents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return JSON.stringify({
        status: "success",
        agents,
        message: `You have ${agents.length} autonomous agent(s).`,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "list_agents",
    description:
      "Lists all autonomous agents for the current user. " +
      "Use when the user asks 'what are my agents', 'show my scheduled tasks', " +
      "'list my bots', etc.",
    schema: z.object({
      userId: z.string().describe("The Firebase UID of the user"),
    }),
  }
);

// ----------------------------------------------------------------
// Tool: Toggle Agent Status
// ----------------------------------------------------------------
const toggleAgentTool = tool(
  async ({ agentId, status }) => {
    try {
      await db.collection("agents").doc(agentId).update({
        status,
        updatedAt: new Date().toISOString(),
      });
      return JSON.stringify({
        status: "success",
        message: `Agent ${agentId} has been ${status === "active" ? "enabled" : "paused"}.`,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "toggle_agent",
    description:
      "Enables or disables an autonomous agent by its ID. " +
      "Use when the user says 'pause my agent', 'stop the daily transfer', 'enable agent X'.",
    schema: z.object({
      agentId: z.string().describe("The Firestore document ID of the agent"),
      status: z.enum(["active", "paused"]).describe("The new status to set"),
    }),
  }
);

module.exports = { createScheduledAgentTool, listAgentsTool, toggleAgentTool };
