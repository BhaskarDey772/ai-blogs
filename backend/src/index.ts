import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import { articlesRouter, editorRouter } from "./routes";
import uploadRoutes  from "./routes/upload";
// import { setupArticleJob } from "./services"; // Disabled to save AI tokens
import { clerkMiddleware } from "@clerk/express";

const app: Express = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ai-blogs";

// Middleware
app.use(express.json());
app.use(cookieParser());

// Simple request logger (controls: NODE_ENV and LOG_REQUESTS)
const shouldLogRequests =
  process.env.LOG_REQUESTS === "true" || process.env.NODE_ENV !== "production";
if (shouldLogRequests) {
  app.use((req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on("finish", () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      let meta = `${method} ${originalUrl} ${status} ${duration}ms`;

      // In non-production show small request body summary for POST/PUT/PATCH
      if (
        req.body &&
        (method === "POST" || method === "PUT" || method === "PATCH")
      ) {
        try {
          const bodyStr = JSON.stringify(req.body);
          const short =
            bodyStr.length > 200 ? bodyStr.slice(0, 200) + "..." : bodyStr;
          meta += ` body=${short}`;
        } catch (e) {
          // ignore body stringify errors
        }
      }
    });

    next();
  });
}

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
    ].filter((url): url is string => !!url),
    credentials: true,
  })
);

// Health check endpoint (public - no auth)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// IMPORTANT: Add Clerk middleware AFTER public routes
// This makes Clerk available but doesn't enforce auth on all routes
app.use(clerkMiddleware());

// Articles router: handles its own auth for public vs protected endpoints
app.use("/api/articles", articlesRouter);
app.use("/api",express.raw({ type: "*/*", limit: "20mb" }), uploadRoutes);
// Editor routes (draft heartbeat + flush)
app.use("/api/editor", editorRouter);

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
    // setupArticleJob(); // Disabled to save AI tokens

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
