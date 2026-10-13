"use strict";

const FeesService = require("../../services/student/fees.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getFees = asyncHandler(async (req, res, next) => {
  const result = await FeesService.getFees(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Fee information");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Fees retrieved", data: result.data });
});

module.exports = { getFees };