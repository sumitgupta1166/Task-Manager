import { Router } from "express";
import { body, query } from "express-validator";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { TASK_STATUSES } from "../constants.js";

const router = Router();

// All task routes are protected
router.use(verifyJWT);

router
  .route("/")
  .get(
    [
      query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
      query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1–50"),
      query("status").optional().isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
      validate,
    ],
    getTasks
  )
  .post(
    [
      body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 2, max: 150 }).withMessage("Title must be 2–150 characters"),

      body("description")
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

      body("status")
        .optional()
        .isIn(TASK_STATUSES)
        .withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),

      validate,
    ],
    createTask
  );

router
  .route("/:id")
  .get(getTask)
  .patch(
    [
      body("title")
        .optional()
        .trim()
        .isLength({ min: 2, max: 150 }).withMessage("Title must be 2–150 characters"),

      body("description")
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

      body("status")
        .optional()
        .isIn(TASK_STATUSES)
        .withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),

      validate,
    ],
    updateTask
  )
  .delete(deleteTask);

export default router;
