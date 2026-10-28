"use strict";

const StudentPortalService = require("../StudentPortalService");
const { success, failure } = require("../../utils/serviceResult");

const getDashboard = async (user) => {
  return await StudentPortalService.getStudentDashboard(user);
};

module.exports = { getDashboard };