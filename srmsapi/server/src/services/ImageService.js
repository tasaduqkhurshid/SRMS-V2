"use strict";

const path = require("path");
const PwpConstants = require("../constants/PwpConstants");

/**
 * Normalize various incoming image representations into a multer-like file object
 * shape used by the service layer: { buffer, originalname, mimetype }
 *
 * Supported inputs:
 * - data URL string: "data:<mime>;base64,<data>"
 * - plain base64 string
 * - multer file object with `buffer` property
 * - object with `data: [...]` (array of bytes)
 *
 * Returns the normalized file object or throws an Error on unsupported input.
 */

/**
 * Validate file against entity type constraints
 * @param {String} entityType - Entity type (STUDENT, SCHOOL_LOGO, etc.)
 * @param {Object} file - File object with buffer, mimetype, originalname
 * @returns {Object} - { isValid: boolean, error: string or null }
 */
const validateImageFile = (entityType, file) => {
  if (!PwpConstants.isValidImageType(entityType)) {
    return { isValid: false, error: `Invalid entity type: ${entityType}` };
  }

  if (!file || !file.buffer) {
    return { isValid: false, error: "File buffer is required" };
  }

  const ext = path.extname(file.originalname || '').slice(1).toLowerCase();
  
  if (!PwpConstants.isValidExtension(entityType, ext)) {
    const entity = PwpConstants.getImageEntity(entityType);
    return { 
      isValid: false, 
      error: `Invalid file extension. Allowed: ${entity.allowedExtensions.join(', ')}` 
    };
  }

  if (!PwpConstants.isValidMimeType(entityType, file.mimetype)) {
    const entity = PwpConstants.getImageEntity(entityType);
    return { 
      isValid: false, 
      error: `Invalid MIME type. Allowed: ${entity.allowedMimes.join(', ')}` 
    };
  }

  if (!PwpConstants.isValidFileSize(entityType, file.buffer.length)) {
    const entity = PwpConstants.getImageEntity(entityType);
    const maxSizeMB = Math.round(entity.maxSize / (1024 * 1024));
    return { 
      isValid: false, 
      error: `File too large. Maximum size: ${maxSizeMB}MB` 
    };
  }

  return { isValid: true, error: null };
};

const normalizeImageToFile = async (image, opts = {}) => {
  if (!image) throw new Error("image is required");

  // prefer explicit filename passed via opts
  const preferName = opts.image_name || opts.file_name || opts.originalname || null;

  // If already a multer-like object
  if (image && image.buffer) {
    return {
      buffer: image.buffer,
      originalname: preferName || image.originalname || `upload_${Date.now()}${path.extname(image.originalname||'.jpg')}`,
      mimetype: image.mimetype || "application/octet-stream",
    };
  }

  // If it's an object with data array (Buffer-like JSON)
  if (image && image.data && Array.isArray(image.data)) {
    return {
      buffer: Buffer.from(image.data),
      originalname: preferName || `upload_${Date.now()}.jpg`,
      mimetype: image.mimetype || "image/jpeg",
    };
  }

  // If it's a string: data URL or plain base64
  if (typeof image === "string") {
    const dataUrlMatch = image.match(/^data:(.+);base64,(.*)$/);
    let base64Data = image;
    let mime = "image/jpeg";

    if (dataUrlMatch) {
      mime = dataUrlMatch[1] || mime;
      base64Data = dataUrlMatch[2] || "";
    } else {
      // plain base64 — strip whitespace/newlines
      base64Data = base64Data.replace(/\s+/g, "");
    }

    if (!base64Data) throw new Error("Invalid base64 image data");

    const buffer = Buffer.from(base64Data, "base64");
    return {
      buffer,
      originalname: preferName || `upload_${Date.now()}.jpg`,
      mimetype: mime,
    };
  }

  throw new Error("Unsupported image format; expected data URL, base64 string, or multer file object");
};

module.exports = {
  normalizeImageToFile,
  validateImageFile,
};
