"use strict";

const SchoolService = require("../services/SchoolService");
const { ValidationError, NotFoundError, ConflictError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

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

module.exports = { register, me, getById, update };