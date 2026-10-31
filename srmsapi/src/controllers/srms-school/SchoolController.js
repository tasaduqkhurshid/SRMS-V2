"use strict";

const SchoolService = require("../../services/SchoolService");
const { ValidationError, NotFoundError, ConflictError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const { brandingAssetUrl } = require("../../utils/brandingUrls");

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
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "School profile retrieved", data: { school: s } });
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

  const brandData = {
    schoolCode: school.school_code,
    name: school.name || school.school_name,
    abbreviation: school.abbreviation || school.school_code,
    address: school.address || "",
    phone: school.phone || school.contact_number || "",
    email: school.email || "",
    website: school.website || "",
    logoUrl: brandingAssetUrl(school, "logo") || school.logo_url || school.logo_path || "",
    campusImageUrl: brandingAssetUrl(school, "welcome-image") || school.campus_image_url || "",
    tagline: school.branding?.tagline || "A place to learn, grow, and succeed.",
    description: school.branding?.description || "A welcoming place to support learning, academic progress, and student success.",
  };

  res.set("Cache-Control", "private, no-store");
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "School brand retrieved", data: brandData });
});

module.exports = { register, me, getById, update, getSchoolBrand };