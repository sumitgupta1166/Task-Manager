import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Known operational error (our ApiError)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Mongoose duplicate key error (e.g. unique email/username)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [],
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      errors: [],
    });
  }

  // Fallback: unknown error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
  });
};
