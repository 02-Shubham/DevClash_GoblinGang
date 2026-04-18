/**
 * routes/authRoutes.js
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { registerUser, linkWallet, getProfile } = require("../controllers/authController");

router.post("/register", verifyToken, registerUser);
router.post("/link-wallet", verifyToken, linkWallet);
router.get("/profile", verifyToken, getProfile);

module.exports = router;
