/**
 * middleware/authMiddleware.js
 * ---------------------------
 * Verifies the Firebase ID Token sent by the frontend on each request.
 * Attaches `req.user` (uid, email, wallet) to all protected routes.
 */

const { auth, db } = require("../firebaseAdmin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the token with Firebase Auth
    const decoded = await auth.verifyIdToken(idToken);

    // Fetch user's Firestore profile to get wallet address
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Attach full user context to the request object
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      walletAddress: userData.walletAddress || null,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { verifyToken };
