"use strict";

const {
  isOperationalError,
  getErrorStatusCode,
  getErrorCode,
  getErrorMessage,
} = require("./applicationErrors");

const normalizeError = (error, context = "Application exception") => {
  return {
    message: getErrorMessage(error),
    statusCode: getErrorStatusCode(error),
    code: getErrorCode(error),
    isOperational: isOperationalError(error),
    context,
  };
};

const handleCatch = (error, context = "Application exception") => {
  return normalizeError(error, context);
};

const handleCatchAndThrow = (error, context = "Application exception") => {
  const normalized = normalizeError(error, context);
  const enrichedError = new Error(normalized.message);
  enrichedError.statusCode = normalized.statusCode;
  enrichedError.code = normalized.code;
  enrichedError.isOperational = normalized.isOperational;
  enrichedError.context = normalized.context;
  enrichedError.cause = error;
  throw enrichedError;
};

module.exports = {
  handleCatch,
  handleCatchAndThrow,
  normalizeError,
};