import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { COOKIE_OPTIONS } from "../constants.js";

// ─── Helper ──────────────────────────────────────────────────────────────────
const generateTokens = async (userId) => {
  const user = await User.findById(userId).select("+refreshToken");
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // persist refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const user = await User.create({ username, email, password });

  // Don't return password
  const createdUser = await User.findById(user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// ─── Login ────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id);

  // Set tokens in HTTP-only cookies
  res
    .cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 min
    })
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: loggedInUser, accessToken }, // accessToken also sent for non-cookie clients
      "Login successful"
    )
  );
});

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from DB
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// ─── Get current user ─────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

// ─── Refresh Access Token ─────────────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch or user not found");
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

  return res
    .cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

export { register, login, logout, getMe, refreshAccessToken };
