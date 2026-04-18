/**
 * routes/agentRoutes.js
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  createAgent,
  getAgents,
  toggleAgent,
  deleteAgent,
} = require("../controllers/agentController");

router.post("/create", verifyToken, createAgent);
router.get("/", verifyToken, getAgents);
router.patch("/:agentId/toggle", verifyToken, toggleAgent);
router.delete("/:agentId", verifyToken, deleteAgent);

module.exports = router;
