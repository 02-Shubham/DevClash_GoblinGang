/**
 * controllers/agentController.js
 * --------------------------------
 * CRUD operations for user-created autonomous agents.
 * These are the "custom" agents — different from the default Nexus orchestrator.
 */

const { db } = require("../firebaseAdmin");
const orchestratorService = require("../services/orchestratorService");
const intentService = require("../services/intentService");
const validationService = require("../services/validationService");

/**
 * POST /api/agent/create
 * Creates a custom autonomous agent.
 * Parses natural language, validates it, and stores it in Firebase.
 * Body: { name, intent, wallet, permissions }
 */
const createAgent = async (req, res) => {
  const { uid } = req.user;
  const { name, intent, wallet, permissions } = req.body;

  if (!intent) {
    return res.status(400).json({ error: "intent is required" });
  }

  try {
    // 1. Parse intent using Gemini
    const parsedIntent = await intentService.parseIntent(intent);

    // 2. Validate parsed intent
    const validation = validationService.validateIntent(parsedIntent);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        error: validation.error 
      });
    }

    // 3. Apply permissions check
    const maxSpend = permissions?.maxSpend || 0;
    if (parsedIntent.action.amount > maxSpend && maxSpend > 0) {
      return res.status(400).json({ 
        success: false,
        error: `Action amount (${parsedIntent.action.amount}) exceeds max spend limit (${maxSpend}).` 
      });
    }

    // 4. Store in Firebase
    const agentData = {
      name: name || "Unnamed Agent",
      userWallet: wallet || "Not provided",
      userId: uid, // Keeping userId for filtering
      intentText: intent,
      parsedIntent,
      permissions: permissions || { maxSpend: 0 },
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("agents").add(agentData);

    return res.status(201).json({
      success: true,
      agent: {
        agentId: docRef.id,
        ...agentData,
      },
    });
  } catch (error) {
    console.error("❌ createAgent error detail:", error);
    return res.status(500).json({ error: error.message || "Failed to create agent" });
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
      .get();

    const agents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort in-memory to avoid requiring a composite index
    agents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
