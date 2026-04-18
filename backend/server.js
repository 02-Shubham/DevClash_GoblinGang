/**
 * server.js
 * ---------
 * Main application entry point.
 * Sets up Express, loads Firebase, mounts all routes,
 * and starts the autonomous Execution Engine.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Firebase must be initialized before any other service imports
require("./firebaseAdmin");

// Routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const agentRoutes = require("./routes/agentRoutes");
const logRoutes = require("./routes/logRoutes");

// Autonomous Execution Engine
const { startExecutionEngine } = require("./services/executionService");

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------------------
// Middleware
// ----------------------------------------------------------------
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"] // TODO: Replace with actual domain
    : "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ----------------------------------------------------------------
// Routes
// ----------------------------------------------------------------
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/agents", agentRoutes);
app.use("/logs", logRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Intent-Based Autonomous Agent Infrastructure",
    timestamp: new Date().toISOString(),
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ----------------------------------------------------------------
// Start Server
// ----------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}\n`);

  // Start the autonomous agent execution engine
  startExecutionEngine();
});

module.exports = app;
