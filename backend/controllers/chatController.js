/**
 * controllers/chatController.js
 * ------------------------------
 * Handles chat interactions with the Nexus Orchestrator.
 * Calls the orchestratorService and returns the AI response
 * along with any pending transaction data for the frontend.
 */

const orchestratorService = require("../services/orchestratorService");
const { db } = require("../firebaseAdmin");

/**
 * POST /chat
 * Body: { message: string, chatHistory?: Array }
 * Headers: Authorization: Bearer <firebase_id_token>
 */
const chat = async (req, res) => {
  const { uid, walletAddress } = req.user;
  const { message, chatHistory = [] } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    // Process the user's message through the Nexus Orchestrator
    const result = await orchestratorService.processChat(
      message,
      uid,
      walletAddress,
      chatHistory
    );

    // Persist the chat message to Firestore for history
    await db.collection("chatHistory").add({
      userId: uid,
      userMessage: message,
      agentResponse: result.response,
      hasTransaction: !!result.transactionData,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      response: result.response,
      transactionData: result.transactionData || null,
      // If transactionData exists, frontend should prompt wallet signature
    });
  } catch (error) {
    console.error("chat controller error:", error);
    const message = String(error?.message || "");
    if (message.includes("429") || message.toLowerCase().includes("quota exceeded")) {
      return res.status(429).json({
        error: "AI provider quota exceeded. Update Featherless plan/quota and retry.",
      });
    }
    if (message.includes("401") || message.toLowerCase().includes("api key")) {
      return res.status(401).json({
        error: "AI provider authentication failed. Check FEATHERLESS_API_KEY.",
      });
    }
    if (message.includes("404") && message.toLowerCase().includes("models/")) {
      return res.status(500).json({
        error: "Configured AI model is unavailable. Update FEATHERLESS_MODEL in backend/.env.",
      });
    }
    res.status(500).json({ error: "Orchestrator failed to process request" });
  }
};

/**
 * GET /chat/history
 * Returns the last N messages for the current user.
 */
const getChatHistory = async (req, res) => {
  const { uid } = req.user;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const snapshot = await db
      .collection("chatHistory")
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ messages: messages.reverse() });
  } catch (error) {
    console.error("getChatHistory error:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

module.exports = { chat, getChatHistory };
