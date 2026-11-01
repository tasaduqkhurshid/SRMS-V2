"use strict";

const SchoolService = require("../../services/SchoolService");
const storage = require("../../services/storage/storage.service");
const { School } = require("../../db/models");
const logger = require("../../utils/logger");
const { ValidationError, NotFoundError, ConflictError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const { brandingAssetUrl } = require("../../utils/brandingUrls");
const { constructImageUrl } = require("../../utils/imageUrl");

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

const register = asyncHandler(async (req, res, next) => {
  const { school: schoolData, admin: adminData } = req.body;

  const school = {
    school_name: schoolData?.school_name,
    school_code: schoolData?.school_code,
    slug: schoolData?.slug || schoolData?.school_code?.toLowerCase(),
    status: schoolData?.status || "active",
    address: schoolData?.address || null,
    contact_number: schoolData?.contact_number || null,
    phone: schoolData?.contact_number || null,
    email: schoolData?.email || null,
  };

  const admin = {
    username: adminData?.username,
    password: adminData?.password,
    pin: adminData?.pin || null,
  };

  const existingSchool = await SchoolService.findSchoolByCode(school.school_code);
  if (existingSchool.error) return next(existingSchool.error);
  if (existingSchool.data) {
    throw new ConflictError("School code already exists");
  }

  if (school.email) {
    const existingSchoolByEmail = await SchoolService.findSchoolByEmail(school.email);
    if (existingSchoolByEmail.error) return next(existingSchoolByEmail.error);
    if (existingSchoolByEmail.data) {
      throw new ConflictError("School email already exists");
    }
  }

  const result = await SchoolService.registerSchool({ school, admin });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 201, message: "School registered successfully", data: { school_id: result.data } });
});

const me = asyncHandler(async (req, res) => {
  const s = req.school;
  if (!s) {
    throw new NotFoundError("School");
  }

  const { User } = require("../../db/models");
  
  // Count active users for this school
  const activeUsersCount = await User.countDocuments({ school_id: s._id });

  // Get public URLs from cloud storage using helper
  const logoKey = s.branding?.logoKey;
  const welcomeImageKey = s.branding?.welcomeImageKey;
  const logoPublicUrl = logoKey ? constructImageUrl("public", logoKey) : "";
  const campusPublicUrl = welcomeImageKey ? constructImageUrl("public", welcomeImageKey) : "";

  const schoolData = {
    _id: s._id,
    id: s._id,
    school_name: s.school_name || s.name,
    name: s.name || s.school_name,
    abbreviation: s.abbreviation || s.school_code,
    school_code: s.school_code,
    slug: s.slug,
    address: s.address || "",
    city: s.city || "",
    state: s.state || "",
    pincode: s.pincode || "",
    phone: s.phone || s.contact_number || "",
    contact_number: s.contact_number || s.phone || "",
    email: s.email || "",
    website: s.website || "",
    principal_name: s.principal_name || "",
    principal_email: s.principal_email || "",
    year_established: s.year_established || "",
    board: s.board || "",
    logo_url: logoPublicUrl || brandingAssetUrl(s, "logo") || s.logo_url || s.logo_path || "",
    campus_image_url: campusPublicUrl || brandingAssetUrl(s, "welcome-image") || s.campus_image_url || "",
    logoUrl: logoPublicUrl || brandingAssetUrl(s, "logo") || s.logo_url || s.logo_path || "",
    campusImageUrl: campusPublicUrl || brandingAssetUrl(s, "welcome-image") || s.campus_image_url || "",
    tagline: s.branding?.tagline || "A place to learn, grow, and succeed.",
    description: s.branding?.description || "A welcoming place to support learning, academic progress, and student success.",
    branding: s.branding,
    activeUsersCount,
  };

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "School profile retrieved", data: { school: schoolData } });
});

const getById = asyncHandler(async (req, res, next) => {
  const schoolId = req.schoolId;
  if (!schoolId) {
    throw new NotFoundError("School");
  }
  if (req.params.id && String(req.params.id) !== String(schoolId)) {
    throw new NotFoundError("School");
  }

  const result = await SchoolService.getSchoolById(schoolId);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "School retrieved", data: result.data });
});

const update = asyncHandler(async (req, res, next) => {
  logger.debug("**********************SchoolController.update called with body:", req.body);
  const schoolId = req.schoolId;
  if (!schoolId) {
    throw new NotFoundError("School");
  }
  if (req.params.id && String(req.params.id) !== String(schoolId)) {
    throw new NotFoundError("School");
  }

  const result = await SchoolService.updateSchool(schoolId, req.body);
  if (result.error) return next(result.error);

  if (req.session && req.session.school) {
    Object.assign(req.session.school, result.data);
  }

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "School updated successfully", data: result.data });
});

const getSchoolBrand = asyncHandler(async (req, res, next) => {
  const school = req.school;
  if (!school) {
    throw new NotFoundError("School");
  }

  // Get public URLs from cloud storage using helper
  const logoKey = school.branding?.logoKey;
  const welcomeImageKey = school.branding?.welcomeImageKey;
  const logoPublicUrl = logoKey ? constructImageUrl("public", logoKey) : "";
  const campusPublicUrl = welcomeImageKey ? constructImageUrl("public", welcomeImageKey) : "";

  const brandData = {
    schoolCode: school.school_code,
    name: school.name || school.school_name,
    abbreviation: school.abbreviation || school.school_code,
    address: school.address || "",
    phone: school.phone || school.contact_number || "",
    email: school.email || "",
    website: school.website || "",
    logoUrl: logoPublicUrl || brandingAssetUrl(school, "logo") || school.logo_url || school.logo_path || "",
    campusImageUrl: campusPublicUrl || brandingAssetUrl(school, "welcome-image") || school.campus_image_url || "",
    tagline: school.branding?.tagline || "A place to learn, grow, and succeed.",
    description: school.branding?.description || "A welcoming place to support learning, academic progress, and student success.",
  };

  res.set("Cache-Control", "private, no-store");
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "School brand retrieved", data: brandData });
});

const uploadBranding = asyncHandler(async (req, res, next) => {
  const configAsset = assetConfig(req.params.asset);
  if (!configAsset) throw new NotFoundError("Branding asset");
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

  const school = req.school;
  if (!school) throw new NotFoundError("School");

  let key;
  try {
    ({ key } = await storage.uploadBrandingAsset({
      schoolSlug: school.slug,
      asset: configAsset.base,
      body: req.file.buffer,
      contentType: req.file.mimetype,
      extension,
    }));

    // Use public URL from cloud storage for direct access via helper
    const publicUrl = constructImageUrl("public", key);
    const set = { [`branding.${configAsset.field}`]: key };
    if (req.params.asset === "logo") set.logo_url = publicUrl || `/admin/school/branding/${req.params.asset}?v=${encodeURIComponent(key)}`;
    if (req.params.asset === "welcome-image") set.campus_image_url = publicUrl || `/admin/school/branding/${req.params.asset}?v=${encodeURIComponent(key)}`;
    await School.updateOne({ _id: school._id }, { $set: set });
  } catch (error) {
    await storage.deleteBrandingAsset(key).catch(() => {});
    throw error;
  }

  const publicUrl = constructImageUrl("public", key);
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Branding uploaded",
    data: { asset: req.params.asset, url: publicUrl || `/admin/school/branding/${req.params.asset}?v=${encodeURIComponent(key)}`, publicUrl },
  });
});

const deleteBrandingAsset = asyncHandler(async (req, res, next) => {
  const configAsset = assetConfig(req.params.asset);
  if (!configAsset) throw new NotFoundError("Branding asset");
  if (!storage.isConfigured()) {
    throw new ValidationError("Cloud storage is not configured");
  }

  const school = req.school;
  if (!school) throw new NotFoundError("School");

  const key = school.branding?.[configAsset.field];
  if (!key) {
    return sendSuccessJsonResponse(res, {
      statusCode: 200,
      message: "No branding asset to remove",
      data: { asset: req.params.asset },
    });
  }

  await storage.deleteBrandingAsset(key).catch((error) => {
    logger.warn("Unable to remove branding object from storage", error);
  });

  const set = { [`branding.${configAsset.field}`]: "" };
  const legacyField = req.params.asset === "logo" ? "logo_url" : "campus_image_url";
  if (String(school[legacyField] || "").startsWith(`/api/student/school/branding/${req.params.asset}`)) set[legacyField] = "";
  await School.updateOne({ _id: school._id }, { $set: set });

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Branding removed",
    data: { asset: req.params.asset },
  });
});

module.exports = { register, me, getById, update, getSchoolBrand, uploadBranding, deleteBrandingAsset };