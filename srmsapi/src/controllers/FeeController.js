"use strict";

const FeeService = require("../services/FeeService");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");
const { ValidationError } = require("../utils/applicationErrors");

const send = (res, next, result, message, statusCode = 200) => {
  if (result.error) return next(result.error);
  return sendSuccessJsonResponse(res, { statusCode, message, data: result.data });
};
const schoolId = (req) => req.schoolId || req.user?.school_id;
const actorId = (req) => req.user?.id;
const dashboard = asyncHandler(async (req, res, next) => send(res, next, await FeeService.getDashboard(schoolId(req), req.query), "Fee dashboard retrieved"));
const listTypes = asyncHandler(async (req, res, next) => send(res, next, await FeeService.listFeeTypes(schoolId(req)), "Fee types retrieved"));
const saveType = asyncHandler(async (req, res, next) => send(res, next, await FeeService.saveFeeType(schoolId(req), actorId(req), req.body || {}, req.params.id || null), "Fee type saved", req.params.id ? 200 : 201));
const listStructures = asyncHandler(async (req, res, next) => send(res, next, await FeeService.listStructures(schoolId(req), req.query), "Fee structures retrieved"));
const saveStructure = asyncHandler(async (req, res, next) => send(res, next, await FeeService.saveStructure(schoolId(req), actorId(req), req.body || {}, req.params.id || null), "Fee structure saved", req.params.id ? 200 : 201));
const assign = asyncHandler(async (req, res, next) => send(res, next, await FeeService.assignStructure(schoolId(req), actorId(req), req.body || {}), "Fee assignment processed", 201));
const parentAccess = asyncHandler(async (req, res, next) => send(res, next, await FeeService.provisionParentAccess(schoolId(req), actorId(req), req.body || {}), "Parent fee access created", 201));
const listAccounts = asyncHandler(async (req, res, next) => send(res, next, await FeeService.listAccounts(schoolId(req), req.query), "Fee accounts retrieved"));
const getAccount = asyncHandler(async (req, res, next) => send(res, next, await FeeService.getAccount(schoolId(req), req.params.id), "Fee account retrieved"));
const collect = asyncHandler(async (req, res, next) => send(res, next, await FeeService.recordCollection(schoolId(req), actorId(req), req.params.id, req.body || {}), "Fee collection recorded", 201));
const paymentWebhook = asyncHandler(async (req, res, next) => send(res, next, await FeeService.handlePaymentWebhook(req.rawBody, req.get('x-razorpay-signature'), req.body || {}), "Payment notification processed"));
const adjust = asyncHandler(async (req, res, next) => send(res, next, await FeeService.applyAdjustment(schoolId(req), actorId(req), req.params.id, req.body || {}), "Fee adjustment recorded"));
const refund = asyncHandler(async (req, res, next) => send(res, next, await FeeService.refundPayment(schoolId(req), actorId(req), req.params.id, req.body || {}), "Refund recorded", 201));
const listPayments = asyncHandler(async (req, res, next) => send(res, next, await FeeService.listPayments(schoolId(req), req.query), "Fee payments retrieved"));
const receipt = asyncHandler(async (req, res, next) => send(res, next, await FeeService.getReceipt(schoolId(req), req.params.id), "Fee receipt retrieved"));
const audit = asyncHandler(async (req, res, next) => send(res, next, await FeeService.listAudit(schoolId(req), req.query), "Fee audit history retrieved"));
const report = asyncHandler(async (req, res, next) => send(res, next, await FeeService.getReport(schoolId(req), req.query), "Fee report retrieved"));
const reportCsv = asyncHandler(async (req, res, next) => {
  const result = await FeeService.getReport(schoolId(req), { ...req.query, limit: 100 });
  if (result.error) return next(result.error);
  const cell = (value) => {
    let normalized = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(normalized)) normalized = `'${normalized}`;
    return `"${normalized.replace(/"/g, '""')}"`;
  };
  const header = ["Student", "Admission number", "Class", "Academic year", "Fee structure", "Assigned minor", "Concession minor", "Paid minor", "Outstanding minor", "Overdue minor"];
  const lines = [header, ...result.data.rows.map((row) => [
    row.student?.name, row.student?.admission_number || row.student?.roll_number,
    row.course?.course_name, row.academic_year?.name, row.structure_name,
    row.assigned_minor, row.concession_minor, row.paid_minor, row.balance_minor, row.overdue_minor,
  ])].map((line) => line.map(cell).join(","));
  res.status(200).type("text/csv; charset=utf-8").attachment("fee-report-page.csv").send(`\uFEFF${lines.join("\r\n")}`);
});
const onlineSettings = asyncHandler(async (req, res, next) => send(res, next, await FeeService.getOnlinePaymentSettings(req.params.id || schoolId(req)), "Online payment status retrieved"));
const updateOnlineSettings = asyncHandler(async (req, res, next) => send(res, next, await FeeService.setOnlinePaymentSettings(req.params.id, actorId(req), req.body || {}), "Online payment settings updated"));
const studentFees = asyncHandler(async (req, res, next) => {
  return send(res, next, await FeeService.getPortalFees(req.user, req.query.student_id || null), "Student fees retrieved");
});
const studentReceipt = asyncHandler(async (req, res, next) => {
  return send(res, next, await FeeService.getPortalReceipt(req.user, req.params.id, req.query.student_id || null), "Fee receipt retrieved");
});
const studentInitiatePayment = asyncHandler(async (req, res, next) => send(res, next, await FeeService.initiateOnlinePayment(req.user, req.params.id, req.body || {}), "Online payment initiated", 201));
const studentCancelPayment = asyncHandler(async (req, res, next) => send(res, next, await FeeService.cancelOnlinePayment(req.user, req.params.id), "Online payment cancellation checked"));

module.exports = { dashboard, listTypes, saveType, listStructures, saveStructure, assign, parentAccess, listAccounts, getAccount, collect, studentInitiatePayment, studentCancelPayment, paymentWebhook, adjust, refund, listPayments, receipt, audit, report, reportCsv, onlineSettings, updateOnlineSettings, studentFees, studentReceipt };
