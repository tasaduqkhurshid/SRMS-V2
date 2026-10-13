"use strict";

const SubjectService = require("../services/SubjectService");
const { STATUS } = require("../constants/status");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const listSubjects = asyncHandler(async (req, res, next) => {
  const reqParams = { ...req.query, ...req.body, ...req.params };
  logger.debug("listSubjects reqParams:", reqParams);

  const page = Number(reqParams.page || 1);
  const limit = Number(reqParams.limit || 20);
  const query = reqParams.q || reqParams.query || "";

  const result = await SubjectService.listSubjects({ page, limit, query });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Subjects retrieved", data: result.data });
});

const getAllSubjects = asyncHandler(async (req, res, next) => {
  const result = await SubjectService.getAllSubjects();
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "All subjects retrieved", data: result.data });
});

const saveSubject = asyncHandler(async (req, res, next) => {
  const requestParams = { ...(req.query || {}), ...(req.params || {}), ...(req.body || {}) };
  if (req.user) {
    const userSchoolId = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;
    if (userSchoolId) requestParams.school_id = userSchoolId;
  }

  logger.debug("saveSubject requestParams:", requestParams);

  const subjectId = requestParams._id || null;

  if (!subjectId && (!requestParams.subject_name || !requestParams.subject_code)) {
    throw new ValidationError("subject_name and subject_code are required");
  }

  let subjectResult;
  if (subjectId) {
    subjectResult = await SubjectService.updateSubject(subjectId, requestParams);
  } else {
    subjectResult = await SubjectService.createSubject(requestParams);
  }
  if (subjectResult.error) return next(subjectResult.error);
  if (!subjectResult.data) throw new NotFoundError("Subject");

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: subjectId ? "Subject updated" : "Subject created", data: subjectResult.data });
});

const getSubjectDetails = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) throw new ValidationError("subject id is required");

  const result = await SubjectService.getSubjectById(id);
  if (result.error) return next(result.error);
  if (!result.data) throw new NotFoundError("Subject");

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Subject retrieved", data: result.data });
});

const updateSubject = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const payload = req.body || {};
  if (!id) throw new ValidationError("subject id is required");

  const result = await SubjectService.updateSubject(id, payload);
  if (result.error) return next(result.error);
  if (!result.data) throw new NotFoundError("Subject");

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Subject updated", data: result.data });
});

const deleteSubject = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) throw new ValidationError("subject id is required");

  const result = await SubjectService.deleteSubject(id);
  if (result.error) return next(result.error);
  if (!result.data) throw new NotFoundError("Subject");

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Subject deleted" });
});

module.exports = {
  listSubjects,
  getAllSubjects,
  saveSubject,
  getSubjectDetails,
  updateSubject,
  deleteSubject,
};