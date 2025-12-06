import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import { articlesRouter, authRouter } from "./routes";
import { setupArticleJob } from "./services";
import { authMiddleware } from "./middleware/auth";

const app: Express = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ai-blogs";

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.use("/api/auth", authRouter);

// Articles router: handles its own auth for public vs protected endpoints
app.use("/api/articles", articlesRouter);

// MongoDB Connection
async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[DB] Connected to MongoDB successfully");
  } catch (err) {
    console.error("[DB] MongoDB connection error:", err);
    process.exit(1);
  }
}

// Initialize server
async function startServer(): Promise<void> {
  try {
    await connectDB();
    setupArticleJob();

    app.listen(PORT, () => {
      console.log(`[SERVER] Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[SERVER] Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[SERVER] Shutting down gracefully...");
  await mongoose.disconnect();
  process.exit(0);
});
