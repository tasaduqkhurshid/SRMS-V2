"use strict";

const CourseService = require("../services/CourseService");
const { STATUS } = require("../constants/status");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const listCourses = asyncHandler(async (req, res, next) => {
  const params = { page: req.query.page, limit: req.query.limit, query: req.query.q };
  const result = await CourseService.listCourses(params);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Courses retrieved", data: result.data });
});

const getAllCourses = asyncHandler(async (req, res, next) => {
  const result = await CourseService.getAllCourses();
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "All courses retrieved", data: result.data });
});

const getCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("course id is required");
  }
  const result = await CourseService.getCourseById(id);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Course");
  }
  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Course retrieved", data: result.data });
});

const saveCourse = asyncHandler(async (req, res, next) => {
  const requestPayload = req.body || {};
  const id = requestPayload._id || null;
  const { _id, ...payload } = requestPayload;
  if (req.user && !payload.school_id) {
    payload.school_id = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;
  }
  let result;
  if (id) result = await CourseService.updateCourse(id, payload);
  else result = await CourseService.createCourse(payload);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: id ? "Course updated" : "Course created", data: result.data });
});

const deleteCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("course id is required");
  }
  const result = await CourseService.deleteCourse(id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Course deleted" });
});

const listCourseSubjects = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("course id is required");
  }
  const result = await CourseService.getCourseSubjects(id);
  if (result.error) return next(result.error);

  if (req.query && (req.query.flat === "1" || req.query.flat === "true")) {
    const subjects = (Array.isArray(result.data) ? result.data.map((r) => (r && (r.subject || r.subject_id)) ? (r.subject || r.subject_id) : r) : []);
    return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Course subjects retrieved", data: subjects });
  }
  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Course subjects retrieved", data: result.data });
});

const setCourseSubjects = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    throw new ValidationError("course id is required");
  }
  const payload = req.body || {};
  const subjectIds = Array.isArray(payload.subject_ids) ? payload.subject_ids : (payload.subjectIds || []);
  const schoolId = req.user ? (req.user.school_id || req.user.SchoolId || req.user.schoolId || null) : null;
  const result = await CourseService.setCourseSubjects(id, subjectIds, schoolId);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Course subjects updated", data: result.data });
});

module.exports = { listCourses, getAllCourses, getCourse, saveCourse, deleteCourse, listCourseSubjects, setCourseSubjects };
