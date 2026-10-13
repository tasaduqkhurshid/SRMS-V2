"use strict";

const mongoose = require("mongoose");
const { ValidationError } = require("./applicationErrors");

const RESERVED_SLUGS = new Set(["admin", "api", "www", "mail", "smtp", "cdn", "assets"]);

const normalizeSlug = (value) => String(value || "").trim();

const isEmpty = (value) => value === null || value === undefined || String(value).trim() === "";

const getFieldName = (options) => options.field || "Field";

const buildMessage = (options, defaultMessage) => options.message || defaultMessage;

const validateRequired = (value, options) => {
  if (isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
};

const validateString = (value, options) => {
  const str = String(value);
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    if (options.minLength !== undefined && str.length < options.minLength) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be at least ${options.minLength} characters`));
    }
    if (options.maxLength !== undefined && str.length > options.maxLength) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must not exceed ${options.maxLength} characters`));
    }
  }
  return str;
};

const validateSlug = (value, options) => {
  const str = String(value);
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    const normalized = normalizeSlug(str);
    if (normalized !== normalized.toLowerCase()) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be lowercase`));
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be lowercase letters, numbers, and single hyphens`));
    }
    if (RESERVED_SLUGS.has(normalized)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} is reserved`));
    }
    return normalized;
  }
  return str;
};

const validateEmail = (value, options) => {
  const str = String(value);
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(str)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid email address`));
    }
  }
  return str.toLowerCase();
};

const validatePhone = (value, options) => {
  const str = String(value);
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(str.replace(/\s/g, ""))) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid phone number`));
    }
  }
  return str;
};

const validateDate = (value, options) => {
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    const str = String(value);
    const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = str.match(isoDateRegex);
    if (!match) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid date in YYYY-MM-DD format`));
    }
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} is not a valid calendar date`));
    }
    if (options.min && date < new Date(options.min)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be on or after ${options.min}`));
    }
    if (options.max && date > new Date(options.max)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be on or before ${options.max}`));
    }
    return str;
  }
  return str;
};

const validateNumber = (value, options) => {
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    if (typeof value === "string" && !/^-?\d+(\.\d+)?$/.test(value.trim())) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid number`));
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid number`));
    }
    if (options.min !== undefined && num < options.min) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be at least ${options.min}`));
    }
    if (options.max !== undefined && num > options.max) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must not exceed ${options.max}`));
    }
    return num;
  }
  return value;
};

const validateInteger = (value, options) => {
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    if (typeof value === "string" && !/^-?\d+$/.test(value.trim())) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid integer`));
    }
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isInteger(num)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid integer`));
    }
    if (options.min !== undefined && num < options.min) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be at least ${options.min}`));
    }
    if (options.max !== undefined && num > options.max) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must not exceed ${options.max}`));
    }
    return num;
  }
  return value;
};

const validateBoolean = (value, options) => {
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    if (typeof value === "string") {
      const lower = value.toLowerCase().trim();
      if (lower === "true" || lower === "1" || lower === "yes") return true;
      if (lower === "false" || lower === "0" || lower === "no") return false;
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid boolean`));
    }
    return Boolean(value);
  }
  return value;
};

const validatePassword = (value, options) => {
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    const str = String(value);
    const minLength = options.minLength || 8;
    if (str.length < minLength) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be at least ${minLength} characters`));
    }
    if (options.maxLength && str.length > options.maxLength) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must not exceed ${options.maxLength} characters`));
    }
    if (options.requireUppercase && !/[A-Z]/.test(str)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must contain at least one uppercase letter`));
    }
    if (options.requireLowercase && !/[a-z]/.test(str)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must contain at least one lowercase letter`));
    }
    if (options.requireNumber && !/[0-9]/.test(str)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must contain at least one number`));
    }
    if (options.requireSpecial && !/[^A-Za-z0-9]/.test(str)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must contain at least one special character`));
    }
    return str;
  }
  return value;
};

const validateEnum = (value, options) => {
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    const values = options.values || [];
    const str = String(value);
    if (!values.includes(str)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be one of: ${values.join(", ")}`));
    }
    return str;
  }
  return value;
};

const validateUrl = (value, options) => {
  const str = String(value);
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    try {
      new URL(str);
    } catch {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid URL`));
    }
  }
  return str;
};

const validateObjectId = (value, options) => {
  if (options.required && isEmpty(value)) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required`));
  }
  if (!isEmpty(value)) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be a valid ObjectId`));
    }
  }
  return value;
};

const validateArray = (value, options) => {
  if (options.required && (isEmpty(value) || !Array.isArray(value))) {
    throw new ValidationError(buildMessage(options, `${getFieldName(options)} is required and must be an array`));
  }
  if (!isEmpty(value)) {
    if (!Array.isArray(value)) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must be an array`));
    }
    if (options.minLength !== undefined && value.length < options.minLength) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must contain at least ${options.minLength} items`));
    }
    if (options.maxLength !== undefined && value.length > options.maxLength) {
      throw new ValidationError(buildMessage(options, `${getFieldName(options)} must not exceed ${options.maxLength} items`));
    }
    if (options.itemType && options.itemOptions) {
      return value.map((item, index) => {
        const itemOptions = { ...options.itemOptions, field: `${getFieldName(options)}[${index}]` };
        return validate(item, options.itemType, itemOptions);
      });
    }
  }
  return value;
};

const validators = {
  required: (value, options) => {
    validateRequired(value, options);
    return value;
  },
  string: validateString,
  slug: validateSlug,
  email: validateEmail,
  phone: validatePhone,
  date: validateDate,
  number: validateNumber,
  integer: validateInteger,
  boolean: validateBoolean,
  password: validatePassword,
  enum: validateEnum,
  url: validateUrl,
  objectId: validateObjectId,
  array: validateArray,
};

const validate = (value, type, options = {}) => {
  const validator = validators[type];
  if (!validator) {
    throw new ValidationError(`Unknown validation type: ${type}`);
  }
  return validator(value, { required: true, ...options });
};

module.exports = {
  validate,
  validateRequired,
  validateString,
  validateSlug,
  validateEmail,
  validatePhone,
  validateDate,
  validateNumber,
  validateInteger,
  validateBoolean,
  validatePassword,
  validateEnum,
  validateUrl,
  validateObjectId,
  validateArray,
  normalizeSlug,
  RESERVED_SLUGS,
  ValidationError,
};