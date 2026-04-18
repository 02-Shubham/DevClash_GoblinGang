/**
 * controllers/authController.js
 * ------------------------------
 * Handles user registration and wallet linking.
 * Creates the default "Nexus" Orchestrator agent for new users.
 */

const { db } = require("../firebaseAdmin");

/**
 * POST /auth/register
 * Called after the user successfully logs in with Google on the frontend.
 * Creates a user profile in Firestore if one doesn't exist.
 * Also creates a default Orchestrator agent for the user.
 */
const registerUser = async (req, res) => {
  const { uid, email, displayName } = req.user;

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // New user: create profile + default orchestrator agent
      const defaultAgent = await createDefaultAgent(uid);

      await userRef.set({
        uid,
        email,
        displayName: displayName || email,
        walletAddress: null,
        defaultAgentId: defaultAgent.id,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({
        isNewUser: true,
        message: "User registered. Default agent 'Nexus' created.",
        user: { uid, email, defaultAgentId: defaultAgent.id },
      });
    }

    // Existing user: just return their profile
    return res.status(200).json({
      isNewUser: false,
      message: "User already exists.",
      user: userDoc.data(),
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

/**
 * POST /auth/link-wallet
 * Links a MetaMask wallet address to the user's Firestore profile.
 */
const linkWallet = async (req, res) => {
  const { uid } = req.user;
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress is required" });
  }

  // Basic Ethereum address validation
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum wallet address" });
  }

  try {
    await db.collection("users").doc(uid).update({
      walletAddress,
      walletLinkedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      message: "Wallet linked successfully.",
      walletAddress,
    });
  } catch (error) {
    console.error("linkWallet error:", error);
    res.status(500).json({ error: "Failed to link wallet" });
  }
};

/**
 * GET /auth/profile
 * Returns the current user's profile from Firestore.
 */
const getProfile = async (req, res) => {
  const { uid } = req.user;

  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ----------------------------------------------------------------
// Helper: Create the default system orchestrator agent for a new user
// ----------------------------------------------------------------
const createDefaultAgent = async (userId) => {
  const agentData = {
    userId,
    name: "Nexus",
    type: "orchestrator",
    isSystemDefault: true,
    status: "active",
    description: "Your personal AI agent. Chat with Nexus to execute on-chain actions or schedule autonomous tasks.",
    rule: null, // Orchestrators don't have rules — they use the LangChain executor
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection("agents").add(agentData);
  return { id: docRef.id, ...agentData };
};

module.exports = { registerUser, linkWallet, getProfile };
