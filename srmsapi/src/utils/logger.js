"use strict";

const winston = require("winston");

const SUPPORTED_LEVELS = Object.freeze({
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
});

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

const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*["']?[^"'\s]+/gi,
  /pin\s*[:=]\s*["']?[^"'\s]+/gi,
  /token\s*[:=]\s*["']?[^"'\s]+/gi,
  /secret\s*[:=]\s*["']?[^"'\s]+/gi,
  /authorization\s*[:=]\s*["']?[^"'\s]+/gi,
  /api[_-]?key\s*[:=]\s*["']?[^"'\s]+/gi,
];

const sanitizeMessage = (message) => {
  if (typeof message !== "string") {
    return message;
  }
  let sanitized = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      const [key] = match.split(/[:=]/);
      return `${key}: [REDACTED]`;
    });
  }
  return sanitized;
};

const serializeError = (error, seen = new WeakSet()) => {
  if (!(error instanceof Error)) {
    return error;
  }

  if (seen.has(error)) {
    return { name: error.name, message: "[Circular]", stack: undefined };
  }
  seen.add(error);

  const serialized = {
    name: error.name,
    message: sanitizeMessage(error.message),
    stack: error.stack,
  };

  if (error.code !== undefined) {
    serialized.code = error.code;
  }
  if (error.statusCode !== undefined) {
    serialized.statusCode = error.statusCode;
  }
  if (error.cause !== undefined) {
    serialized.cause = serializeError(error.cause, seen);
  }
  if (error.errors !== undefined) {
    serialized.errors = sanitizeMetadata(error.errors, seen);
  }
  if (error.keyPattern !== undefined) {
    serialized.keyPattern = error.keyPattern;
  }
  if (error.keyValue !== undefined) {
    serialized.keyValue = sanitizeMetadata(error.keyValue, seen);
  }

  return serialized;
};

const sanitizeMetadata = (metadata, seen = new WeakSet()) => {
  if (!metadata || typeof metadata !== "object") {
    return metadata;
  }

  if (Array.isArray(metadata)) {
    return metadata.map((item) => sanitizeMetadata(item, seen));
  }

  if (metadata instanceof Error) {
    return serializeError(metadata, seen);
  }

  if (seen.has(metadata)) {
    return "[Circular]";
  }
  seen.add(metadata);

  const sanitized = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeMetadata(value, seen);
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeMessage(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const requestedLevel = String(process.env.LOG_LEVEL || "info")
  .trim()
  .toLowerCase();

const configuredLevel = SUPPORTED_LEVELS.hasOwnProperty(requestedLevel)
  ? requestedLevel
  : "info";

const baseLogger = winston.createLogger({
  level: configuredLevel,
  levels: SUPPORTED_LEVELS,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error", "warn"],
    }),
  ],
});

const writeLog = (level, args) => {
  const [first, ...rest] = args;

  let message = "Application log";
  let metadata = {};

  if (typeof first === "string") {
    message = sanitizeMessage(first);
  } else if (first instanceof Error) {
    message = sanitizeMessage(first.message || "Application exception");
    metadata.error = serializeError(first);
  } else if (first && typeof first === "object") {
    message = sanitizeMessage(first.message || "Application log");
    metadata = { ...first };
    delete metadata.message;
  } else if (first !== undefined) {
    message = sanitizeMessage(String(first));
  }

  const details = rest.map((value) =>
    value instanceof Error ? serializeError(value) : value
  );

  const errors = details.filter(
    (value) =>
      value &&
      typeof value === "object" &&
      typeof value.stack === "string" &&
      typeof value.message === "string"
  );

  const otherDetails = details.filter(
    (value) =>
      !(
        value &&
        typeof value === "object" &&
        typeof value.stack === "string" &&
        typeof value.message === "string"
      )
  );

  if (errors.length) {
    metadata.error = errors.length === 1 ? errors[0] : errors;
  }

  if (otherDetails.length) {
    metadata.details = otherDetails;
  }

  metadata = sanitizeMetadata(metadata);

  baseLogger.log({
    level,
    message,
    ...metadata,
  });
};

const debug = (...args) => writeLog("debug", args);
const info = (...args) => writeLog("info", args);
const warn = (...args) => writeLog("warn", args);
const error = (...args) => writeLog("error", args);

module.exports = {
  debug,
  info,
  warn,
  error,
  level: configuredLevel,
  serializeError,
  sanitizeMetadata,
  sanitizeMessage,
};