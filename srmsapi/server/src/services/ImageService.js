"use strict";

const path = require("path");
const PwpConstants = require("../constants/PwpConstants");
const { ValidationError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const validateImageFile = (entityType, file) => {
  try {
    if (!PwpConstants.isValidImageType(entityType)) {
      return success({ isValid: false, error: `Invalid entity type: ${entityType}` });
    }

    if (!file || !file.buffer) {
      return success({ isValid: false, error: "File buffer is required" });
    }

    const ext = path.extname(file.originalname || "").slice(1).toLowerCase();

    if (!PwpConstants.isValidExtension(entityType, ext)) {
      const entity = PwpConstants.getImageEntity(entityType);
      return success({
        isValid: false,
        error: `Invalid file extension. Allowed: ${entity.allowedExtensions.join(", ")}`,
      });
    }

    if (!PwpConstants.isValidMimeType(entityType, file.mimetype)) {
      const entity = PwpConstants.getImageEntity(entityType);
      return success({
        isValid: false,
        error: `Invalid MIME type. Allowed: ${entity.allowedMimes.join(", ")}`,
      });
    }

    if (!PwpConstants.isValidFileSize(entityType, file.buffer.length)) {
      const entity = PwpConstants.getImageEntity(entityType);
      const maxSizeMB = Math.round(entity.maxSize / (1024 * 1024));
      return success({
        isValid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
      });
    }

    return success({ isValid: true, error: null });
  } catch (error) {
    return failure(error);
  }
};

const normalizeImageToFile = async (image, opts = {}) => {
  try {
    if (!image) throw new ValidationError("image is required");

    const preferName = opts.image_name || opts.file_name || opts.originalname || null;

    if (image && image.buffer) {
      return success({
        buffer: image.buffer,
        originalname: preferName || image.originalname || `upload_${Date.now()}${path.extname(image.originalname || ".jpg")}`,
        mimetype: image.mimetype || "application/octet-stream",
      });
    }

    if (image && image.data && Array.isArray(image.data)) {
      return success({
        buffer: Buffer.from(image.data),
        originalname: preferName || `upload_${Date.now()}.jpg`,
        mimetype: image.mimetype || "image/jpeg",
      });
    }

    if (typeof image === "string") {
      const dataUrlMatch = image.match(/^data:(.+);base64,(.*)$/);
      let base64Data = image;
      let mime = "image/jpeg";

      if (dataUrlMatch) {
        mime = dataUrlMatch[1] || mime;
        base64Data = dataUrlMatch[2] || "";
      } else {
        base64Data = base64Data.replace(/\s+/g, "");
      }

      if (!base64Data) throw new ValidationError("Invalid base64 image data");

      const buffer = Buffer.from(base64Data, "base64");
      return success({
        buffer,
        originalname: preferName || `upload_${Date.now()}.jpg`,
        mimetype: mime,
      });
    }

    throw new ValidationError("Unsupported image format; expected data URL, base64 string, or multer file object");
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  normalizeImageToFile,
  validateImageFile,
};