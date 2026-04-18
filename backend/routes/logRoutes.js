/**
 * routes/logRoutes.js
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getLogs,
  getPendingLogs,
  confirmExecution,
  rejectExecution,
} = require("../controllers/logController");

router.get("/", verifyToken, getLogs);
router.get("/pending", verifyToken, getPendingLogs);
router.patch("/:logId/confirm", verifyToken, confirmExecution);
router.patch("/:logId/reject", verifyToken, rejectExecution);

module.exports = router;
