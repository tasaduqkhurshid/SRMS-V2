"use strict";

const AcademicYearService = require("../services/AcademicYearService");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const listAcademicYears = asyncHandler(async (req, res, next) => {
  const { page, limit, q } = req.query;
  const result = await AcademicYearService.listAcademicYears({ page, limit, query: q });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Academic years retrieved", data: result.data });
});

const getAcademicYear = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("Academic year ID is required");
  }
  const result = await AcademicYearService.getAcademicYearById(id);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Academic year");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Academic year retrieved", data: result.data });
});

const saveAcademicYear = asyncHandler(async (req, res, next) => {
  const payload = req.body || {};
  const id = payload._id || payload.id;
  let result;
  if (id) result = await AcademicYearService.updateAcademicYear(id, payload);
  else result = await AcademicYearService.createAcademicYear(payload);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: id ? "Academic year updated" : "Academic year created", data: result.data });
});

const deleteAcademicYear = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("Academic year ID is required");
  }
  const result = await AcademicYearService.deleteAcademicYear(id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Academic year deleted" });
});

const getAllAcademicYears = asyncHandler(async (req, res, next) => {
  const result = await AcademicYearService.getAllAcademicYears();
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "All academic years retrieved", data: result.data });
});

module.exports = { listAcademicYears, getAcademicYear, saveAcademicYear, deleteAcademicYear, getAllAcademicYears };