"use strict";

const DashboardService = require("../../services/student/dashboard.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getDashboard = asyncHandler(async (req, res, next) => {
  const result = await DashboardService.getDashboard(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Student dashboard");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Dashboard retrieved", data: result.data });
});

module.exports = { getDashboard };