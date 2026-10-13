"use strict";

class ApplicationError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.statusCode = options.statusCode || 500;
    this.code = options.code || "INTERNAL_ERROR";
    this.isOperational = options.isOperational !== false;
    this.details = options.details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ValidationError extends ApplicationError {
  constructor(message, details) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details,
    });
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message = "Authentication required") {
    super(message, {
      statusCode: 401,
      code: "AUTHENTICATION_ERROR",
    });
  }
}

class AuthorizationError extends ApplicationError {
  constructor(message = "Insufficient permissions") {
    super(message, {
      statusCode: 403,
      code: "AUTHORIZATION_ERROR",
    });
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
}

class ConflictError extends ApplicationError {
  constructor(message, details) {
    super(message, {
      statusCode: 409,
      code: "CONFLICT",
      details,
    });
  }
}

class DatabaseError extends ApplicationError {
  constructor(message, cause) {
    super(message, {
      statusCode: 500,
      code: "DATABASE_ERROR",
      isOperational: false,
      cause,
    });
  }
}

const isOperationalError = (error) => {
  if (error instanceof ApplicationError) {
    return error.isOperational;
  }
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return true;
  }
  if (error?.code === 11000) {
    return true;
  }
  if (error?.name === "UnauthorizedError" || error?.name === "JsonWebTokenError") {
    return true;
  }
  return false;
};

const getErrorStatusCode = (error) => {
  if (error instanceof ApplicationError) {
    return error.statusCode;
  }
  if (error?.statusCode && Number.isInteger(error.statusCode)) {
    return error.statusCode;
  }
  if (error?.code === 11000) {
    return 409;
  }
  if (error?.name === "ValidationError") {
    return 400;
  }
  if (error?.name === "CastError") {
    return 400;
  }
  if (error?.name === "UnauthorizedError" || error?.name === "JsonWebTokenError") {
    return 401;
  }
  return 500;
};

const getErrorCode = (error) => {
  if (error instanceof ApplicationError) {
    return error.code;
  }
  if (error?.code) {
    return error.code;
  }
  if (error?.name === "ValidationError") {
    return "VALIDATION_ERROR";
  }
  if (error?.name === "CastError") {
    return "INVALID_ID";
  }
  if (error?.code === 11000) {
    return "DUPLICATE_ENTRY";
  }
  return "INTERNAL_ERROR";
};

const getErrorMessage = (error, includeDetails = false) => {
  if (error instanceof ApplicationError) {
    return error.message;
  }
  if (error?.name === "ValidationError" && error?.errors) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return includeDetails ? messages.join("; ") : "Validation failed";
  }
  if (error?.code === 11000) {
    return includeDetails
      ? "A record with this value already exists"
      : "Duplicate entry";
  }
  if (error?.name === "CastError") {
    return includeDetails ? error.message : "Invalid identifier";
  }
  if (error?.message) {
    return includeDetails ? error.message : "An unexpected error occurred";
  }
  return "An unexpected error occurred";
};

module.exports = {
  ApplicationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  isOperationalError,
  getErrorStatusCode,
  getErrorCode,
  getErrorMessage,
};