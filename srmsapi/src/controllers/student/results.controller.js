"use strict";

const ResultsService = require("../../services/student/results.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getResults = asyncHandler(async (req, res, next) => {
  const result = await ResultsService.getResults(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Student results");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Results retrieved", data: result.data });
});

module.exports = { getResults };