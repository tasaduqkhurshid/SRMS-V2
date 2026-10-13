"use strict";

const ExamService = require("../services/ExamService");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const listExams = asyncHandler(async (req, res, next) => {
  const { page, limit, q } = req.query;
  const result = await ExamService.listExams({ page, limit, query: q });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Exams retrieved", data: result.data });
});

const getAllExams = asyncHandler(async (req, res, next) => {
  const result = await ExamService.getAllExams();
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "All exams retrieved", data: result.data });
});

const getExam = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("Exam ID is required");
  }
  const result = await ExamService.getExamById(id);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Exam");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Exam retrieved", data: result.data });
});

const saveExam = asyncHandler(async (req, res, next) => {
  const requestPayload = req.body || {};
  const id = requestPayload._id || null;
  const { _id, ...payload } = requestPayload;
  if (req.user && !payload.school_id) {
    payload.school_id = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;
  }
  let result;
  if (id) result = await ExamService.updateExam(id, payload);
  else result = await ExamService.createExam(payload);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: id ? "Exam updated" : "Exam created", data: result.data });
});

const deleteExam = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("Exam ID is required");
  }
  const result = await ExamService.deleteExam(id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Exam deleted" });
});

const initializeResults = asyncHandler(async (req, res, next) => {
  const examId = req.params.id;
  if (!examId) {
    throw new ValidationError("Exam ID is required");
  }
  const { course_id } = req.body || {};
  const result = await ExamService.initializeResults(examId, course_id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Results initialized", data: { created: result.data } });
});

module.exports = { listExams, getAllExams, getExam, saveExam, deleteExam, initializeResults };