"use strict";

const { School } = require("../../db/models");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");
const { NotFoundError, ValidationError } = require("../../utils/applicationErrors");
const SchoolGatewayService = require("../../services/common/SchoolGatewayService");
const PlatformGatewayService = require("../../services/srms-admin/PlatformGatewayService");

const list = asyncHandler(async (_req, res) => {
  const result = await PlatformGatewayService.listPlatformGateways();
  if (result.error) throw result.error;
  return sendSuccessJsonResponse(res, { message: "Platform gateways retrieved", data: result.data });
});

const update = asyncHandler(async (req, res) => {
  const result = await PlatformGatewayService.setPlatformGatewayEnabled(req.params.code, req.body?.enabled);
  if (result.error) throw result.error;
  return sendSuccessJsonResponse(res, { message: "Platform gateway availability updated", data: result.data });
});

const schoolGateways = asyncHandler(async (req, res) => {
  if (!await School.exists({ _id: req.params.id })) throw new NotFoundError("School");
  const data = await SchoolGatewayService.list(req.params.id);
  return sendSuccessJsonResponse(res, { message: "School payment gateways retrieved", data });
});

const configureSchoolGateway = asyncHandler(async (req, res) => {
  if (!await School.exists({ _id: req.params.id })) throw new NotFoundError("School");
  const data = await SchoolGatewayService.configure(req.params.id, req.user?.id, req.params.code, req.body || {});
  return sendSuccessJsonResponse(res, { message: "School gateway configuration saved", data });
});

const setSchoolGatewayEnabled = asyncHandler(async (req, res) => {
  if (!await School.exists({ _id: req.params.id })) throw new NotFoundError("School");
  if (typeof req.body?.enabled !== "boolean") throw new ValidationError("enabled must be a boolean");
  const data = await SchoolGatewayService.setEnabled(req.params.id, req.user?.id, req.params.code, req.body.enabled);
  return sendSuccessJsonResponse(res, { message: "School gateway availability updated", data });
});

const validateSchoolGateway = asyncHandler(async (req, res) => {
  if (!await School.exists({ _id: req.params.id })) throw new NotFoundError("School");
  const data = await SchoolGatewayService.validate(req.params.id, req.user?.id, req.params.code);
  return sendSuccessJsonResponse(res, { message: "School gateway credentials validated", data });
});

module.exports = { list, update, schoolGateways, configureSchoolGateway, setSchoolGatewayEnabled, validateSchoolGateway };
