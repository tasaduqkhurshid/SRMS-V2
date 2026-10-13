"use strict";

const ProfileService = require("../../services/student/profile.service");
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

module.exports = { getProfile };