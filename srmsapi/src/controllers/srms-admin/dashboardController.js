"use strict";

const DashboardService = require("../../services/srms-admin/DashboardService");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getDashboardStatistics = asyncHandler(async (_req, res, next) => {
  const result = await DashboardService.getDashboardStatistics();
  if (result.error) return next(result.error);
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Dashboard statistics retrieved",
    data: result.data,
  });
});

module.exports = {
  getDashboardStatistics,
};
