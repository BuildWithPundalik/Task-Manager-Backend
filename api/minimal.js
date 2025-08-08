// Minimal JS version of API for Vercel serverless
const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Simple routes
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API (JS version)",
    status: "working",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Test auth endpoint
app.post("/api/auth/login", (req, res) => {
  res.json({
    message: "Login endpoint reached",
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Test tasks endpoint
app.get("/api/tasks", (req, res) => {
  res.json({
    message: "Tasks endpoint reached",
    tasks: [],
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Export as serverless function handler
module.exports = (req, res) => {
  return app(req, res);
};
