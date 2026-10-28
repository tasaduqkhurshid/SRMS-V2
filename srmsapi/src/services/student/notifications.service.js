"use strict";

const StudentPortalService = require("../StudentPortalService");
const { success, failure } = require("../../utils/serviceResult");

const getNotifications = async (user) => {
  return await StudentPortalService.getStudentNotifications(user);
};

module.exports = { getNotifications };