// controllers/auth.controller.js
const AuthService = require("../services/AuthService");
const SessionStore = require("../utils/SessionStore");
const { STATUS } = require("../constants/status");
const logger  = require("../utils/logger");

const login = async (req, res) => {
  try {
    // accept either username or email for login
    const { username, email, password } = req.body || {};
    const identifier = (username || email || "").trim();

    if (!identifier || !password) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        success: false,
        message: "username/email and password are required",
      });
    }
    const data = await AuthService.login(identifier, password);

    if (!data) {
      return res.status(STATUS.UNAUTHORIZED).json({
        status: "error",
        success: false,
        message: "Invalid credentials",
      });
    }

    // Store user and school data in session
    try {
      if (data.user) {
        SessionStore.storeUserInSession(req, data.user);
      }
      if (data.school) {
        SessionStore.storeSchoolInSession(req, data.school);
      }
    } catch (sessionErr) {
      logger && logger.warn && logger.warn("Failed to store session data:", sessionErr);
    }

    return res.status(STATUS.OK).json({
      status: "success",
      success: true,
      data,
    });
  } catch (err) {
  logger && logger.error && logger.error("login controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      success: false,
      message: "Something went wrong while logging in",
      error: err.message,
    });
  }
};

const loginViaPin = async (req, res) => {
  try {
    const { email, pin } = req.body || {};
    if (!email || !pin) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        success: false,
        message: "email and pin are required",
      });
    }

    const data = await AuthService.loginPin(email.trim(), pin);
    if (!data) {
      return res.status(STATUS.UNAUTHORIZED).json({
        status: "error",
        success: false,
        message: "Invalid credentials",
      });
    }

    // Store user and school data in session
    try {
      if (data.user) {
        SessionStore.storeUserInSession(req, data.user);
      }
      if (data.school) {
        SessionStore.storeSchoolInSession(req, data.school);
      }
    } catch (sessionErr) {
      logger && logger.warn && logger.warn("Failed to store session data:", sessionErr);
    }

    return res.status(STATUS.OK).json({
      status: "success",
      success: true,
      data,
    });
  } catch (err) {
  logger && logger.error && logger.error("loginViaPin controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      success: false,
      message: "Something went wrong while logging in via pin",
      error: err.message,
    });
  }
};

const verifyJWTToken = async (req, res) => {
  try {
    const token = req.query.token; // read from query param

    if (!token) {
      return res.status(STATUS.BAD_REQUEST).json({
        valid: false,
        error: "Token is required",
      });
    }

    const user = await AuthService.verifyToken(token);

    if (!user) {
      return res.status(STATUS.UNAUTHORIZED).json({
        valid: false,
        error: "Invalid or expired token",
      });
    }

    return res.status(STATUS.OK).json({
      valid: true,
      user,
    });
  } catch (err) {
  logger && logger.error && logger.error("verifyJWTToken controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      valid: false,
      error: "Failed to verify token",
      details: err.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clear session data
    SessionStore.clearSession(req);

    return res.status(STATUS.OK).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
  logger && logger.error && logger.error("logout controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to logout",
      error: err.message,
    });
  }
};

module.exports = { login, loginViaPin, verifyJWTToken, logout };
