/**
 * controllers/agentController.js
 * --------------------------------
 * CRUD operations for user-created autonomous agents.
 * These are the "custom" agents — different from the default Nexus orchestrator.
 */

const { db } = require("../firebaseAdmin");
const orchestratorService = require("../services/orchestratorService");

/**
 * POST /agents/create
 * Creates a custom autonomous agent using natural language intent.
 * Uses the Orchestrator to parse and structure the intent.
 * Body: { intentText: string }
 */
const createAgent = async (req, res) => {
  const { uid, walletAddress } = req.user;
  const { intentText } = req.body;

  if (!intentText) {
    return res.status(400).json({ error: "intentText is required" });
  }

  try {
    // Ask the Orchestrator to parse the intent as a scheduled agent creation
    const parsePrompt = `Parse this into a scheduled agent (do not execute immediately): "${intentText}". My userId is "${uid}".`;
    const result = await orchestratorService.processChat(
      parsePrompt,
      uid,
      walletAddress || "not connected"
    );

    return res.status(201).json({
      message: result.response,
      intent: intentText,
    });
  } catch (error) {
    console.error("createAgent error:", error);
    res.status(500).json({ error: "Failed to create agent" });
  }
};

/**
 * GET /agents
 * Lists all agents for the current user.
 */
const getAgents = async (req, res) => {
  const { uid } = req.user;

  try {
    const snapshot = await db
      .collection("agents")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const agents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ agents });
  } catch (error) {
    console.error("getAgents error:", error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
};

/**
 * PATCH /agents/:agentId/toggle
 * Enables or disables an agent.
 * Body: { status: "active" | "paused" }
 */
const toggleAgent = async (req, res) => {
  const { uid } = req.user;
  const { agentId } = req.params;
  const { status } = req.body;

  if (!["active", "paused"].includes(status)) {
    return res.status(400).json({ error: "status must be 'active' or 'paused'" });
  }

  try {
    const agentRef = db.collection("agents").doc(agentId);
    const agentDoc = await agentRef.get();

    if (!agentDoc.exists) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Ensure the agent belongs to this user
    if (agentDoc.data().userId !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await agentRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      message: `Agent ${status === "active" ? "enabled" : "paused"} successfully.`,
      agentId,
      status,
    });
  } catch (error) {
    console.error("toggleAgent error:", error);
    res.status(500).json({ error: "Failed to toggle agent" });
  }
};

/**
 * DELETE /agents/:agentId
 * Deletes an agent permanently.
 */
const deleteAgent = async (req, res) => {
  const { uid } = req.user;
  const { agentId } = req.params;

  try {
    const agentRef = db.collection("agents").doc(agentId);
    const agentDoc = await agentRef.get();

    if (!agentDoc.exists) {
      return res.status(404).json({ error: "Agent not found" });
    }

    if (agentDoc.data().userId !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (agentDoc.data().isSystemDefault) {
      return res.status(400).json({ error: "Cannot delete the default system agent" });
    }

    await agentRef.delete();
    return res.status(200).json({ message: "Agent deleted successfully." });
  } catch (error) {
    console.error("deleteAgent error:", error);
    res.status(500).json({ error: "Failed to delete agent" });
  }
};

module.exports = { createAgent, getAgents, toggleAgent, deleteAgent };
