import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import { TASK_STATUSES } from "../constants.js";
import { encrypt } from "../utils/encrypt.js";
import mongoose from "mongoose";

// ─── Create Task ──────────────────────────────────────────────────────────────
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;

  const task = await Task.create({
    title,
    description: description || "",
    status: status || "todo",
    owner: req.user._id,
  });

  // Encrypt description in response (assignment: encrypt sensitive fields)
  const responseData = {
    ...task.toObject(),
    description: task.description ? encrypt(task.description) : "",
  };

  return res
    .status(201)
    .json(new ApiResponse(201, responseData, "Task created successfully"));
});

// ─── Get All Tasks (paginate + filter by status + search by title) ─────────────
const getTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build filter — owner is always enforced (authorization)
  const filter = { owner: req.user._id };

  if (status) {
    if (!TASK_STATUSES.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${TASK_STATUSES.join(", ")}`);
    }
    filter.status = status;
  }

  if (search && search.trim() !== "") {
    // Text search OR regex on title (regex is safer for partial match)
    filter.title = { $regex: search.trim(), $options: "i" };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
    Task.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tasks,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      "Tasks fetched successfully"
    )
  );
});

// ─── Get Single Task ──────────────────────────────────────────────────────────
const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Authorization: task must belong to requesting user
  if (task.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view this task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
});

// ─── Update Task ──────────────────────────────────────────────────────────────
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this task");
  }

  const { title, description, status } = req.body;

  // Only update provided fields
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) {
    if (!TASK_STATUSES.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${TASK_STATUSES.join(", ")}`);
    }
    task.status = status;
  }

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

// ─── Delete Task ──────────────────────────────────────────────────────────────
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this task");
  }

  await task.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Task deleted successfully"));
});

export { createTask, getTasks, getTask, updateTask, deleteTask };
