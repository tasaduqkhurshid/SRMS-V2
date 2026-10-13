"use strict";

const StudentPortalService = require("../StudentPortalService");
const { success, failure } = require("../../utils/serviceResult");

const getPerformance = async (user) => {
  return await StudentPortalService.getStudentPerformance(user);
};

module.exports = { getPerformance };