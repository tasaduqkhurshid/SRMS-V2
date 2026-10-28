"use strict";

const AuthService = require("../services/AuthService");
const SessionStore = require("../utils/SessionStore");
const { STATUS } = require("../constants/status");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");
const { ValidationError, AuthenticationError, AuthorizationError } = require("../utils/applicationErrors");

const login = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body || {};
  const identifier = (username || email || "").trim();

  if (!identifier || !password) {
    throw new ValidationError("username/email and password are required");
  }

  const result = req.isPlatformHost
    ? await AuthService.loginSuperAdmin(identifier, password)
    : await AuthService.login(identifier, password, req.schoolId);

  if (result.error) return next(result.error);
  if (!result.data) {
    throw new AuthenticationError("Invalid credentials");
  }

  try {
    if (result.data.user) {
      SessionStore.storeUserInSession(req, result.data.user);
    }
    if (result.data.school) {
      SessionStore.storeSchoolInSession(req, result.data.school);
    }
  } catch (sessionErr) {
    logger.warn("Failed to store session data:", sessionErr);
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Login successful",
    data: result.data,
  });
});

const loginViaPin = asyncHandler(async (req, res, next) => {
  const { username, email, pin } = req.body || {};
  const identifier = String(username || email || "").trim();

  if (!identifier || !pin) {
    throw new ValidationError("username/email and pin are required");
  }

  if (req.isPlatformHost) {
    throw new AuthorizationError("PIN login is not enabled for platform administrators");
  }

  const result = await AuthService.loginPin(identifier, pin, req.schoolId);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new AuthenticationError("Invalid credentials");
  }

  try {
    if (result.data.user) {
      SessionStore.storeUserInSession(req, result.data.user);
    }
    if (result.data.school) {
      SessionStore.storeSchoolInSession(req, result.data.school);
    }
  } catch (sessionErr) {
    logger.warn("Failed to store session data:", sessionErr);
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "PIN login successful",
    data: result.data,
  });
});

const verifyJWTToken = asyncHandler(async (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    throw new ValidationError("Token is required");
  }

  const result = await AuthService.verifyToken(token);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new AuthenticationError("Invalid or expired token");
  }

  if (
    req.isPlatformHost
      ? result.data.role !== "SUPER_ADMIN"
      : String(result.data.school_id) !== String(req.schoolId)
  ) {
    throw new AuthorizationError("Token belongs to a different portal");
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Token verified",
    data: { valid: true, user: result.data },
  });
});

const logout = asyncHandler(async (req, res) => {
  SessionStore.clearSession(req);

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Logged out successfully",
  });
});

module.exports = { login, loginViaPin, verifyJWTToken, logout };