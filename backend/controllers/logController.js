/**
 * controllers/logController.js
 * ----------------------------
 * Fetches execution logs and allows frontend to confirm tx signatures.
 */

const { db } = require("../firebaseAdmin");

/**
 * GET /logs
 * Fetches execution log history for the current user.
 */
const getLogs = async (req, res) => {
  const { uid } = req.user;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const snapshot = await db
      .collection("executionLogs")
      .where("userId", "==", uid)
      .orderBy("triggeredAt", "desc")
      .limit(limit)
      .get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("getLogs error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

/**
 * GET /logs/pending
 * Fetches pending transactions waiting for wallet signature.
 * The frontend polls this to show "Sign Transaction" prompts.
 */
const getPendingLogs = async (req, res) => {
  const { uid } = req.user;

  try {
    const snapshot = await db
      .collection("executionLogs")
      .where("userId", "==", uid)
      .where("status", "==", "pending_signature")
      .get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ pendingTransactions: logs });
  } catch (error) {
    console.error("getPendingLogs error:", error);
    res.status(500).json({ error: "Failed to fetch pending transactions" });
  }
};

/**
 * PATCH /logs/:logId/confirm
 * Called by the frontend after the user successfully signs and broadcasts
 * the transaction. Updates the log with the tx hash and status.
 * Body: { txHash: string }
 */
const confirmExecution = async (req, res) => {
  const { uid } = req.user;
  const { logId } = req.params;
  const { txHash } = req.body;

  if (!txHash) {
    return res.status(400).json({ error: "txHash is required" });
  }

  try {
    const logRef = db.collection("executionLogs").doc(logId);
    const logDoc = await logRef.get();

    if (!logDoc.exists) {
      return res.status(404).json({ error: "Log not found" });
    }

    if (logDoc.data().userId !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await logRef.update({
      status: "executed",
      txHash,
      executedAt: new Date().toISOString(),
    });

    return res.status(200).json({ message: "Transaction confirmed.", txHash });
  } catch (error) {
    console.error("confirmExecution error:", error);
    res.status(500).json({ error: "Failed to confirm execution" });
  }
};

/**
 * PATCH /logs/:logId/reject
 * Called when the user rejects the transaction in MetaMask.
 */
const rejectExecution = async (req, res) => {
  const { uid } = req.user;
  const { logId } = req.params;

  try {
    const logRef = db.collection("executionLogs").doc(logId);
    const logDoc = await logRef.get();

    if (!logDoc.exists) return res.status(404).json({ error: "Log not found" });
    if (logDoc.data().userId !== uid) return res.status(403).json({ error: "Forbidden" });

    await logRef.update({
      status: "rejected",
      executedAt: new Date().toISOString(),
    });

    return res.status(200).json({ message: "Transaction rejected." });
  } catch (error) {
    console.error("rejectExecution error:", error);
    res.status(500).json({ error: "Failed to reject execution" });
  }
};

module.exports = { getLogs, getPendingLogs, confirmExecution, rejectExecution };
