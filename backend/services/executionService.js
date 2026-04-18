/**
 * services/executionService.js
 * ----------------------------
 * The Autonomous Execution Engine.
 * Runs as a background worker that polls Firestore for active
 * autonomous agents and evaluates their trigger conditions.
 *
 * Trigger Types:
 *   - "time":  Runs after a specified interval (e.g., every 24h)
 *   - "price": Runs when a coin's price crosses a threshold
 *
 * When a condition is met:
 *   - Logs a "pending" execution event in Firestore
 *   - The frontend will poll for pending events and prompt the user to sign
 */

const { db } = require("../firebaseAdmin");
const priceService = require("./priceService");
const web3Service = require("./web3Service");

// Coin symbol to CoinGecko ID mapping
const COINGECKO_ID_MAP = {
  ETH: "ethereum",
  BTC: "bitcoin",
  WBTC: "wrapped-bitcoin",
  USDC: "usd-coin",
  USDT: "tether",
};

// ----------------------------------------------------------------
// Trigger Evaluators
// ----------------------------------------------------------------

/**
 * Evaluates a time-based trigger.
 * @param {object} trigger - The trigger config from Firestore
 * @param {string|null} lastRun - ISO timestamp of the last run
 * @returns {boolean}
 */
const evaluateTimeTrigger = (trigger, lastRun) => {
  // Parse interval (e.g., "24h", "1h", "7d")
  const value = trigger.value; // e.g. "24h"
  const match = value.match(/^(\d+)([hmd])$/);
  if (!match) return false;

  const amount = parseInt(match[1]);
  const unit = match[2];

  let intervalMs;
  if (unit === "h") intervalMs = amount * 60 * 60 * 1000;
  else if (unit === "d") intervalMs = amount * 24 * 60 * 60 * 1000;
  else if (unit === "m") intervalMs = amount * 60 * 1000;

  if (!lastRun) return true; // Never run before → run now
  const elapsed = Date.now() - new Date(lastRun).getTime();
  return elapsed >= intervalMs;
};

/**
 * Evaluates a price-based trigger.
 * @param {object} trigger - { condition: ">"|"<"|"==", value: "3000", coin: "ETH" }
 * @returns {Promise<boolean>}
 */
const evaluatePriceTrigger = async (trigger) => {
  const coin = trigger.coin || "ETH";
  const coinGeckoId = COINGECKO_ID_MAP[coin.toUpperCase()] || "ethereum";
  const currentPrice = await priceService.getPrice(coinGeckoId);
  const targetPrice = parseFloat(trigger.value);

  if (trigger.condition === ">") return currentPrice > targetPrice;
  if (trigger.condition === "<") return currentPrice < targetPrice;
  if (trigger.condition === "==") return Math.abs(currentPrice - targetPrice) < 1;
  return false;
};

// ----------------------------------------------------------------
// Execution Trigger
// ----------------------------------------------------------------

/**
 * Records a "pending execution" event in Firestore.
 * The frontend polls this collection and prompts the user to sign.
 */
const triggerExecution = async (agent, agentId) => {
  let txData = null;

  try {
    const action = agent.rule.action;

    if (action.type === "transfer") {
      txData = await web3Service.prepareTransfer(
        action.params.toAddress,
        action.params.amount
      );
    } else if (action.type === "swap") {
      txData = await web3Service.prepareSwap(
        action.params.fromToken,
        action.params.toToken,
        action.params.amount
      );
    }

    // Log the pending execution to Firestore
    await db.collection("executionLogs").add({
      agentId,
      userId: agent.userId,
      status: "pending_signature",
      transactionData: txData,
      triggeredAt: new Date().toISOString(),
      executedAt: null,
      txHash: null,
    });

    // Update agent's lastRun timestamp
    await db.collection("agents").doc(agentId).update({
      lastRun: new Date().toISOString(),
    });

    console.log(`🚀 Triggered agent [${agentId}] for user [${agent.userId}]`);
  } catch (error) {
    console.error(`❌ Failed to trigger agent [${agentId}]:`, error.message);
  }
};

// ----------------------------------------------------------------
// Main Polling Loop
// ----------------------------------------------------------------

/**
 * Polls all active autonomous agents and evaluates their triggers.
 * Called on an interval by the worker or server startup.
 */
const runExecutionCycle = async () => {
  console.log("⏱️  Running execution cycle...");

  try {
    // Fetch all active autonomous agents
    const snapshot = await db
      .collection("agents")
      .where("status", "==", "active")
      .where("type", "==", "autonomous")
      .get();

    if (snapshot.empty) {
      console.log("   No active agents found.");
      return;
    }

    const evaluations = snapshot.docs.map(async (doc) => {
      const agent = doc.data();
      const agentId = doc.id;
      const trigger = agent.rule?.trigger;

      if (!trigger) return;

      let conditionMet = false;

      if (trigger.type === "time") {
        conditionMet = evaluateTimeTrigger(trigger, agent.lastRun);
      } else if (trigger.type === "price") {
        conditionMet = await evaluatePriceTrigger(trigger);
      }

      if (conditionMet) {
        await triggerExecution(agent, agentId);
      }
    });

    await Promise.allSettled(evaluations);
    console.log(`✅ Execution cycle complete. Evaluated ${snapshot.size} agent(s).`);
  } catch (error) {
    console.error("❌ Execution cycle error:", error.message);
  }
};

/**
 * Starts the background polling interval.
 */
const startExecutionEngine = () => {
  const intervalMs = parseInt(process.env.EXECUTION_INTERVAL_MS) || 60000;
  console.log(`🤖 Execution Engine started (polling every ${intervalMs / 1000}s)`);

  // Run once immediately, then on interval
  runExecutionCycle();
  return setInterval(runExecutionCycle, intervalMs);
};

module.exports = { startExecutionEngine, runExecutionCycle };
