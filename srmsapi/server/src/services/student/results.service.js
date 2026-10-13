"use strict";

const StudentPortalService = require("../StudentPortalService");
const { success, failure } = require("../../utils/serviceResult");

const getResults = async (user) => {
  return await StudentPortalService.getStudentResults(user);
};

module.exports = { getResults };