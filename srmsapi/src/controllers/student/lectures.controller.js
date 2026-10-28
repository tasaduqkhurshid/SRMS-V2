"use strict";

const LecturesService = require("../../services/student/lectures.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getLectures = asyncHandler(async (req, res, next) => {
  const result = await LecturesService.getLectures(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Lectures");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Lectures retrieved", data: result.data });
});

module.exports = { getLectures };