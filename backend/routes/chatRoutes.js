/**
 * routes/chatRoutes.js
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { chat, getChatHistory } = require("../controllers/chatController");

router.post("/", verifyToken, chat);
router.get("/history", verifyToken, getChatHistory);

module.exports = router;
