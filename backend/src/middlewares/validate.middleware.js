import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Runs after express-validator checks.
 * Collects all errors and throws a single ApiError with all messages.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(422, messages[0], messages);
  }
  next();
};
