import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth.routes.js";
import taskRouter from "./routes/task.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // needed for cookies
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ── Rate limiting (prevent brute-force) ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for auth endpoints
  message: { success: false, message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/tasks", taskRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy 🚀" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export { app };
