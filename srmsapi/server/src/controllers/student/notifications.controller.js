"use strict";

const NotificationsService = require("../../services/student/notifications.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getNotifications = asyncHandler(async (req, res, next) => {
  const result = await NotificationsService.getNotifications(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Notifications");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Notifications retrieved", data: result.data });
});

module.exports = { getNotifications };