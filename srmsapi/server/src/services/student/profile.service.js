"use strict";

const StudentPortalService = require("../StudentPortalService");
const { success, failure } = require("../../utils/serviceResult");

const getProfile = async (user) => {
  return await StudentPortalService.getStudentProfile(user);
};

module.exports = { getProfile };