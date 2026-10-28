"use strict";

const PerformanceService = require("../../services/student/performance.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getPerformance = asyncHandler(async (req, res, next) => {
  const result = await PerformanceService.getPerformance(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Performance data");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Performance retrieved", data: result.data });
});

module.exports = { getPerformance };