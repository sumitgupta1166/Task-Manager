import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  getMe,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

// ── Public routes ────────────────────────────────────────────────────────────

router.post(
  "/register",
  [
    body("username")
      .trim()
      .notEmpty().withMessage("Username is required")
      .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters")
      .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, underscores"),

    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    validate,
  ],
  register
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password")
      .notEmpty().withMessage("Password is required"),

    validate,
  ],
  login
);

router.post("/refresh-token", refreshAccessToken);

// ── Protected routes ─────────────────────────────────────────────────────────

router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getMe);

export default router;
