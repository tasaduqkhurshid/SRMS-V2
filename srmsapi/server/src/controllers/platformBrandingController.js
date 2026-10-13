"use strict";

const { randomUUID } = require("node:crypto");
const { School } = require("../db/models");
const storage = require("../services/storage/storage.service");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError, AuthorizationError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const MIME_TO_EXTENSION = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const hasValidImageSignature = (buffer, mimeType) => {
  if (!Buffer.isBuffer(buffer)) return false;
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === "image/webp") return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return false;
};

const assetConfig = (asset) => {
  if (asset === "logo") return { field: "logoKey", base: "logo" };
  if (asset === "welcome-image") return { field: "welcomeImageKey", base: "welcome" };
  return null;
};

const uploadBranding = asyncHandler(async (req, res, next) => {
  const config = assetConfig(req.params.asset);
  if (!config) throw new NotFoundError("Branding asset");
  if (!req.isPlatformHost || String(req.user?.role).toUpperCase() !== "SUPER_ADMIN") {
    throw new AuthorizationError("Super Admin access required");
  }
  if (!storage.isConfigured()) {
    throw new ValidationError("Cloud storage is not configured");
  }
  if (!req.file) throw new ValidationError("Choose an image to upload");

  const extension = MIME_TO_EXTENSION.get(String(req.file.mimetype || "").toLowerCase());
  const clientExtension = String(req.file.originalname || "").split(".").pop().toLowerCase();
  const allowedExtensions = extension === "jpg" ? ["jpg", "jpeg"] : [extension];
  if (!extension || !allowedExtensions.includes(clientExtension) || !hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
    throw new ValidationError("Use a valid JPEG, PNG, or WebP image");
  }

  const school = await School.findById(req.params.schoolId).lean();
  if (!school) throw new NotFoundError("School");

  const key = storage.createUploadKey({
    schoolSlug: school.slug,
    category: "branding",
    filename: `${config.base}-${randomUUID()}`,
    extension,
  });

  await storage.uploadFile({ key, body: req.file.buffer, contentType: req.file.mimetype, cacheControl: "public, max-age=300" });

  try {
    await School.updateOne({ _id: school._id }, { $set: { [`branding.${config.field}`]: key } });
  } catch (error) {
    await storage.deleteFile(key).catch(() => {});
    throw error;
  }

  const previousKey = school.branding?.[config.field];
  if (previousKey && previousKey !== key) {
    await storage.deleteFile(previousKey).catch((error) => {
      logger.warn("Unable to remove replaced branding object", error);
    });
  }

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Branding uploaded",
    data: { asset: req.params.asset, url: `/api/student/school/branding/${req.params.asset}` },
  });
});

const getBrandingAsset = asyncHandler(async (req, res, next) => {
  const config = assetConfig(req.params.asset);
  if (!config || !req.school) throw new NotFoundError("Branding image");
  const key = req.school.branding?.[config.field];
  if (!key) throw new NotFoundError("Branding image");
  if (!storage.isConfigured()) throw new ValidationError("Cloud storage is not configured");

  try {
    const object = await storage.getFile(key);
    const contentType = MIME_TO_EXTENSION.has(object.contentType) ? object.contentType : "application/octet-stream";
    if (contentType === "application/octet-stream") throw new Error("Invalid branding image content type");
    res.set({
      "Content-Type": contentType,
      "Content-Length": String(object.body.length),
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    });
    return res.status(200).send(object.body);
  } catch (error) {
    const status = error.status || (error.name === "NoSuchKey" || error.name === "NotFound" ? 404 : 502);
    if (status !== 404) logger.error("School branding image retrieval failed:", error.message);
    if (status === 404) throw new NotFoundError("Branding image");
    if (status === 503) throw new ValidationError("Cloud storage is not configured");
    throw new ValidationError("Unable to load school branding image");
  }
});

module.exports = { uploadBranding, getBrandingAsset, MIME_TO_EXTENSION };