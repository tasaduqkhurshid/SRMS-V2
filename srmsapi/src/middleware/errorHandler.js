"use strict";

const {
  isOperationalError,
  getErrorStatusCode,
  getErrorCode,
  getErrorMessage,
} = require("../utils/applicationErrors");
const logger = require("../utils/logger");
const { sendFailedJSonResponse } = require("../utils/responseHelpers");

const isProduction = process.env.NODE_ENV === "production";

const SENSITIVE_QUERY_PARAMS = new Set([
  "password",
  "pin",
  "token",
  "secret",
  "authorization",
  "api_key",
  "apikey",
  "access_token",
  "refresh_token",
]);

const sanitizeUrl = (url) => {
  try {
    const parsed = new URL(url, `http://${url.split("/")[0]}`);
    for (const param of SENSITIVE_QUERY_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, "[REDACTED]");
      }
    }
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
};

const sanitizeRequestContext = (req) => {
  const context = {
    method: req.method,
    url: sanitizeUrl(req.originalUrl),
    ip: req.ip,
    userAgent: req.get("user-agent"),
    requestId: req.requestId,
    userId: req.user?.id || req.user?._id,
    schoolId: req.schoolId,
  };

  return context;
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = getErrorStatusCode(err);
  const errorCode = getErrorCode(err);
  const message = getErrorMessage(err, !isProduction);
  const isOperational = isOperationalError(err);

  const requestContext = sanitizeRequestContext(req);

  const alreadyLogged = err._loggedByGlobalHandler === true;

  if (!alreadyLogged) {
    if (!isOperational || statusCode >= 500) {
      logger.error("Unhandled application error", err, {
        context: "Global error handler",
        ...requestContext,
      });
    } else {
      logger.warn("Operational error handled", {
        context: "Global error handler",
        message: err.message,
        code: errorCode,
        statusCode,
        ...requestContext,
      });
    }
    err._loggedByGlobalHandler = true;
  }

  return sendFailedJSonResponse(res, {
    statusCode,
    message,
    code: errorCode,
    details: !isProduction && !isOperational ? err.details : undefined,
    stack: !isProduction && !isOperational ? err.stack : undefined,
  });
};

const notFoundHandler = (req, res) => {
  return sendFailedJSonResponse(res, {
    statusCode: 404,
    code: "NOT_FOUND",
    message: `API endpoint not found: ${req.method} ${sanitizeUrl(req.originalUrl)}`,
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};