"use strict";

const StudentPortalService = require("../StudentPortalService");
const { success, failure } = require("../../utils/serviceResult");

const getAttendance = async (user) => {
  return await StudentPortalService.getStudentAttendance(user);
};

module.exports = { getAttendance };