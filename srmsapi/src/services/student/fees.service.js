"use strict";

const StudentPortalService = require("../StudentPortalService");
const { success, failure } = require("../../utils/serviceResult");

const getFees = async (user) => {
  return await StudentPortalService.getStudentFees(user);
};

module.exports = { getFees };