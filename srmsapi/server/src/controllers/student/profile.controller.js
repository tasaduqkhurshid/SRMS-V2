"use strict";

const ProfileService = require("../../services/student/profile.service");
const StudentService = require("../../services/StudentService");
const { assertPortalStudentAccess } = require("../../services/feeAuthorization");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getProfile = asyncHandler(async (req, res, next) => {
  const result = await ProfileService.getProfile(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Student profile");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Profile retrieved", data: result.data });
});

const getPhoto = asyncHandler(async (req, res, next) => {
  const studentId = req.user?.auth_type === "student"
    ? req.user.student_id
    : req.query.student_id;
  if (!studentId) throw new NotFoundError("Student profile image");
  assertPortalStudentAccess(req.user, studentId);
  const result = await StudentService.getStudentImage(studentId, req.user.school_id);
  if (result.error) return next(result.error);
  if (!result.data) throw new NotFoundError("Student profile image");
  res.set({ "Content-Type": result.data.mimeType, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  return res.status(200).send(result.data.buffer);
});

module.exports = { getProfile, getPhoto };
