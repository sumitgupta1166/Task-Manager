import mongoose from "mongoose";
import { TASK_STATUSES } from "../constants.js";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: `Status must be one of: ${TASK_STATUSES.join(", ")}`,
      },
      default: "todo",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // index for faster user-specific queries
    },
  },
  { timestamps: true }
);

// Compound index: owner + status for filtered queries
taskSchema.index({ owner: 1, status: 1 });
// Text index for search by title
taskSchema.index({ title: "text", description: "text" });

export const Task = mongoose.model("Task", taskSchema);
