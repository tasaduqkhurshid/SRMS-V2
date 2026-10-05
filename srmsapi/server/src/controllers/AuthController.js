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
    const data = req.isPlatformHost
      ? await AuthService.loginSuperAdmin(identifier, password)
      : await AuthService.login(identifier, password, req.schoolId);

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
    const { username, email, pin } = req.body || {};
    const identifier = String(username || email || '').trim();
    if (!identifier || !pin) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        success: false,
        message: "username/email and pin are required",
      });
    }

    if (req.isPlatformHost) {
      return res.status(STATUS.FORBIDDEN).json({ status: 'error', message: 'PIN login is not enabled for platform administrators' });
    }
    const data = await AuthService.loginPin(identifier, pin, req.schoolId);
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
    if (req.isPlatformHost ? user.role !== 'SUPER_ADMIN' : String(user.school_id) !== String(req.schoolId)) {
      return res.status(STATUS.UNAUTHORIZED).json({ valid: false, error: 'Token belongs to a different portal' });
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
