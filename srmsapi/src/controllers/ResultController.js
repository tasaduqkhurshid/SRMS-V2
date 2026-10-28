"use strict";

const ResultService = require("../services/ResultService");
const logger = require("../utils/logger");
const { STATUS } = require("../constants/status");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const listResults = asyncHandler(async (req, res, next) => {
  const { page, limit, student_id, course_id, subject_id, exam_id, academic_year_id } = req.query;
  const result = await ResultService.listResultsByFilters({ page, limit, student_id, course_id, subject_id, exam_id, academic_year_id });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Results retrieved", data: result.data });
});

const getResult = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) throw new ValidationError("Result ID is required");
  const result = await ResultService.getResultById(id);
  if (result.error) return next(result.error);
  if (!result.data) throw new NotFoundError("Result");

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Result retrieved", data: result.data });
});

const saveResult = asyncHandler(async (req, res, next) => {
  const payload = req.body || {};
  logger.debug("ResultController.save payload:", payload);

  if (!payload.student_id || !payload.subject_id || !payload.exam_id || !payload.academic_year_id) {
    const missing = [];
    if (!payload.student_id) missing.push("student_id");
    if (!payload.subject_id) missing.push("subject_id");
    if (!payload.exam_id) missing.push("exam_id");
    if (!payload.academic_year_id) missing.push("academic_year_id");
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
  }

  let savedResult;
  const resId = payload._id || payload.id;
  if (resId) {
    savedResult = await ResultService.updateResultById(resId, payload);
  } else {
    savedResult = await ResultService.createNewResult(payload);
  }
  if (savedResult.error) return next(savedResult.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Result saved", data: savedResult.data });
});

const bulkSaveResults = asyncHandler(async (req, res, next) => {
  const { rows, academic_year_id } = req.body || {};
  let schoolId = null;
  if (req.user) schoolId = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;

  if (!rows || !Array.isArray(rows)) {
    throw new ValidationError("rows array is required");
  }

  if (!academic_year_id) {
    throw new ValidationError("academic_year_id is required");
  }

  const result = await ResultService.bulkUpsertResults(rows, schoolId, academic_year_id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Results bulk saved",
    data: { created_count: result.data.length, results: result.data },
  });
});

const deleteResult = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) throw new ValidationError("Result ID is required");
  const result = await ResultService.deleteResultById(id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Result deleted" });
});

const generateMarksheet = asyncHandler(async (req, res, next) => {
  const { student_id, exam_ids, template_id, academic_year_id } = req.body;

  if (!student_id || !exam_ids || !Array.isArray(exam_ids) || exam_ids.length === 0 || !template_id) {
    throw new ValidationError("Required fields missing: student_id, exam_ids (array), template_id");
  }

  const result = await ResultService.generateCompleteMarksheet(
    student_id,
    exam_ids,
    template_id,
    academic_year_id || null
  );
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Marksheet generated",
    data: result.data,
    html: result.data?.html,
  });
});

module.exports = { listResults, getResult, saveResult, bulkSaveResults, deleteResult, generateMarksheet };