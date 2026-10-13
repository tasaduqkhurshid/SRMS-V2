"use strict";

const AttendanceService = require("../../services/student/attendance.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getAttendance = asyncHandler(async (req, res, next) => {
  const result = await AttendanceService.getAttendance(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Attendance");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Attendance retrieved", data: result.data });
});

module.exports = { getAttendance };