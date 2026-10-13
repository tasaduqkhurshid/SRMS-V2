"use strict";

const { serializeError, sanitizeMetadata } = require("./logger");

/**
 * Create a successful service result
 * @param {*} data - The successful result data
 * @returns {{ data: *, error: null }}
 */
const success = (data) => ({
  data,
  error: null,
});

/**
 * Create a failed service result
 * @param {Error|*} error - The error that caused the failure
 * @returns {{ data: null, error: * }}
 */
const failure = (error) => ({
  data: null,
  error: normalizeError(error),
});

/**
 * Normalize an error to a consistent format preserving diagnostic information
 * @param {Error|*} error - The error to normalize
 * @returns {Object} Normalized error object
 */
const normalizeError = (error) => {
  if (!error) {
    return {
      name: "UnknownError",
      message: "An unknown error occurred",
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    };
  }

  if (error && typeof error === "object" && error.name && error.message && error.code && error.statusCode) {
    return serializeError(error);
  }

  if (error instanceof Error) {
    return serializeError(error);
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
      code: "ERROR",
      statusCode: 500,
    };
  }

  if (error && typeof error === "object") {
    return {
      name: error.name || "ObjectError",
      message: error.message || JSON.stringify(error),
      code: error.code || "OBJECT_ERROR",
      statusCode: error.statusCode || 500,
      details: sanitizeMetadata(error),
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  };
};

/**
 * Check if a result object represents a failure
 * @param {{ data: *, error: * }} result - The service result to check
 * @returns {boolean}
 */
const isFailure = (result) => result && result.error !== null;

/**
 * Check if a result object represents a success
 * @param {{ data: *, error: * }} result - The service result to check
 * @returns {boolean}
 */
const isSuccess = (result) => result && result.error === null;

/**
 * Extract data from a successful result, or throw the error if failed
 * @param {{ data: *, error: * }} result - The service result
 * @returns {*} The data from a successful result
 * @throws {Error} The normalized error if the result is a failure
 */
const unwrapOrThrow = (result) => {
  if (isFailure(result)) {
    const err = new Error(result.error.message);
    err.name = result.error.name;
    err.code = result.error.code;
    err.statusCode = result.error.statusCode;
    err.details = result.error.details;
    err.cause = result.error.cause;
    throw err;
  }
  return result.data;
};

/**
 * Map a successful result to a new value, or pass through failure
 * @param {{ data: *, error: * }} result - The service result
 * @param {Function} fn - Function to transform the data
 * @returns {{ data: *, error: * }} New result with transformed data or original failure
 */
const mapSuccess = (result, fn) => {
  if (isFailure(result)) {
    return result;
  }
  try {
    return success(fn(result.data));
  } catch (error) {
    return failure(error);
  }
};

/**
 * Chain a service operation that returns a result
 * @param {{ data: *, error: * }} result - The service result
 * @param {Function} fn - Function that takes data and returns a new result
 * @returns {Promise<{ data: *, error: * }>} New result from the chained operation
 */
const chain = async (result, fn) => {
  if (isFailure(result)) {
    return result;
  }
  try {
    return await fn(result.data);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  success,
  failure,
  normalizeError,
  isFailure,
  isSuccess,
  unwrapOrThrow,
  mapSuccess,
  chain,
};