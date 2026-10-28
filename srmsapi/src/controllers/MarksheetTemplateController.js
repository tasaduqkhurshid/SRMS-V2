"use strict";

const MarksheetTemplateService = require("../services/MarksheetTemplateService");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const listMarksheetEntities = asyncHandler(async (req, res, next) => {
  const result = MarksheetTemplateService.getMarksheetEntityCatalog();
  if (result.error) return next(result.error);
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Available marksheet entities", data: result.data });
});

const listMarksheetTemplates = asyncHandler(async (req, res, next) => {
  const { page, limit, q } = req.query;
  const result = await MarksheetTemplateService.listMarksheetTemplates({ page, limit, query: q });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Templates retrieved", data: result.data });
});

const getMarksheetTemplate = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) throw new ValidationError("Template ID is required");
  const result = await MarksheetTemplateService.getMarksheetTemplateById(id);
  if (result.error) return next(result.error);
  if (!result.data) throw new NotFoundError("Template");

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Template retrieved", data: result.data });
});

const saveMarksheetTemplate = asyncHandler(async (req, res, next) => {
  const payload = req.body || {};
  const id = payload._id || payload.id;
  let result;
  if (id) {
    result = await MarksheetTemplateService.updateMarksheetTemplate(id, payload);
  } else {
    result = await MarksheetTemplateService.createMarksheetTemplate(payload);
  }
  if (result.error) return next(result.error);
  if (!result.data) throw new NotFoundError("Template");

  return sendSuccessJsonResponse(res, { statusCode: 200, message: id ? "Template updated" : "Template created", data: result.data });
});

const deleteMarksheetTemplate = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) throw new ValidationError("Template ID is required");
  const result = await MarksheetTemplateService.deleteMarksheetTemplate(id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Template deleted" });
});

module.exports = { listMarksheetEntities, listMarksheetTemplates, getMarksheetTemplate, saveMarksheetTemplate, deleteMarksheetTemplate };
