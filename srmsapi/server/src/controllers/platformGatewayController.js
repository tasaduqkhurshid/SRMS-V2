"use strict";
const { Gateway, SchoolGateway, School } = require("../db/models");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");
const { NotFoundError, ValidationError } = require("../utils/applicationErrors");
const SchoolGatewayService = require("../services/SchoolGatewayService");

const list = asyncHandler(async (_req, res) => {
  const [gateways, schoolRows] = await Promise.all([Gateway.find({}).sort({ name: 1 }).lean(), SchoolGateway.find({}).select("school_id gateway_id isEnabled credentialsConfigured configurationStatus validationStatus environment updatedAt").populate("school_id", "school_name").lean()]);
  const data = gateways.map((gateway) => ({ ...gateway, schools: schoolRows.filter((row) => String(row.gateway_id) === String(gateway._id)) }));
  return sendSuccessJsonResponse(res, { message: "Platform gateways retrieved", data });
});
const update = asyncHandler(async (req, res) => {
  if (typeof req.body?.enabled !== "boolean") throw new ValidationError("enabled must be a boolean");
  if (req.body.enabled && (await Gateway.exists({ code: req.params.code, integrationStatus: { $ne: "implemented" } }))) throw new ValidationError("A provider cannot be enabled before its payment integration is implemented");
  const gateway = await Gateway.findOneAndUpdate({ code: req.params.code }, { $set: { isEnabled: req.body.enabled } }, { new: true, runValidators: true }).lean();
  if (!gateway) throw new NotFoundError("Payment gateway");
  return sendSuccessJsonResponse(res, { message: "Platform gateway availability updated", data: gateway });
});
const schoolGateways = asyncHandler(async (req, res) => {
  if (!(await School.exists({ _id: req.params.id }))) throw new NotFoundError("School");
  const data = await SchoolGatewayService.list(req.params.id);
  return sendSuccessJsonResponse(res, { message: "School payment gateways retrieved", data });
});
const configureSchoolGateway = asyncHandler(async (req, res) => {
  if (!(await School.exists({ _id: req.params.id }))) throw new NotFoundError("School");
  const data = await SchoolGatewayService.configure(req.params.id, req.user?.id, req.params.code, req.body || {});
  return sendSuccessJsonResponse(res, { message: "School gateway configuration saved", data });
});
const setSchoolGatewayEnabled = asyncHandler(async (req, res) => {
  if (!(await School.exists({ _id: req.params.id }))) throw new NotFoundError("School");
  if (typeof req.body?.enabled !== "boolean") throw new ValidationError("enabled must be a boolean");
  const data = await SchoolGatewayService.setEnabled(req.params.id, req.user?.id, req.params.code, req.body.enabled);
  return sendSuccessJsonResponse(res, { message: "School gateway availability updated", data });
});
const validateSchoolGateway = asyncHandler(async (req, res) => {
  if (!(await School.exists({ _id: req.params.id }))) throw new NotFoundError("School");
  const data = await SchoolGatewayService.validate(req.params.id, req.user?.id, req.params.code);
  return sendSuccessJsonResponse(res, { message: "School gateway credentials validated", data });
});
module.exports = { list, update, schoolGateways, configureSchoolGateway, setSchoolGatewayEnabled, validateSchoolGateway };
