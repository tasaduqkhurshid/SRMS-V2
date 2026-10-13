"use strict";

const isProduction = process.env.NODE_ENV === "production";

const SENSITIVE_FIELDS = new Set([
  "password",
  "pin",
  "token",
  "secret",
  "authorization",
  "cookie",
  "session",
  "jwt",
  "access_token",
  "refresh_token",
  "api_key",
  "apikey",
  "private_key",
  "privatekey",
  "keyvalue",
  "key_value",
]);

const sanitizeMessage = (message) => {
  if (typeof message !== "string") {
    return message;
  }
  let sanitized = message;
  const patterns = [
    /password\s*[:=]\s*["']?[^"'\s]+/gi,
    /pin\s*[:=]\s*["']?[^"'\s]+/gi,
    /token\s*[:=]\s*["']?[^"'\s]+/gi,
    /secret\s*[:=]\s*["']?[^"'\s]+/gi,
    /authorization\s*[:=]\s*["']?[^"'\s]+/gi,
    /api[_-]?key\s*[:=]\s*["']?[^"'\s]+/gi,
  ];
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, (match) => {
      const [key] = match.split(/[:=]/);
      return `${key}: [REDACTED]`;
    });
  }
  return sanitized;
};

const sanitizeDetails = (details) => {
  if (!details || typeof details !== "object") {
    return details;
  }
  if (Array.isArray(details)) {
    return details.map((item) => sanitizeDetails(item));
  }
  const sanitized = {};
  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeDetails(value);
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeMessage(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Send a standardized successful JSON response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {number} options.statusCode - HTTP status code (default: 200)
 * @param {*} options.data - Response data
 * @param {string} options.message - Success message (default: "Success")
 * @param {Object} [options.pagination] - Pagination metadata
 * @param {Object} [options.meta] - Additional metadata
 * @returns {Object} Express response
 */
const sendSuccessJsonResponse = (res, options = {}) => {
  const {
    statusCode = 200,
    data = null,
    message = "Success",
    pagination = null,
    meta = null,
    ...extraFields
  } = options;

  const response = {
    status: "success",
    success: true,
    message: sanitizeMessage(message),
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  if (meta) {
    response.meta = meta;
  }

  Object.assign(response, extraFields);

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized failed JSON response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {number} options.statusCode - HTTP status code (default: 500)
 * @param {string} options.message - Error message (default: "An error occurred")
 * @param {string} options.code - Application error code (default: "INTERNAL_ERROR")
 * @param {Object} [options.details] - Additional error details (will be sanitized)
 * @param {Object} [options.validationErrors] - Validation errors array
 * @returns {Object} Express response
 */
const sendFailedJSonResponse = (res, options = {}) => {
  const {
    statusCode = 500,
    message = "An error occurred",
    code = "INTERNAL_ERROR",
    details = null,
    validationErrors = null,
    ...extraFields
  } = options;

  const response = {
    status: "error",
    success: false,
    code,
    message: sanitizeMessage(message),
  };

  if (details) {
    response.details = sanitizeDetails(details);
  }

  if (validationErrors) {
    response.validationErrors = Array.isArray(validationErrors)
      ? validationErrors.map((ve) =>
          typeof ve === "string" ? sanitizeMessage(ve) : sanitizeDetails(ve)
        )
      : sanitizeDetails(validationErrors);
  }

  if (!isProduction && process.env.DEBUG_ERRORS === "true") {
    if (options.stack) response.stack = options.stack;
    if (options.cause) response.cause = options.cause;
  }

  Object.assign(response, extraFields);

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccessJsonResponse,
  sendFailedJSonResponse,
  sanitizeMessage,
  sanitizeDetails,
};