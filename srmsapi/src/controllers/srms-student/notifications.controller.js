"use strict";

const NotificationService = require("../../services/common/NotificationService");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");
const { ValidationError, NotFoundError } = require("../../utils/applicationErrors");

const getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, is_read, category, type } = req.query;

  if (req.user.auth_type !== "student") {
    return sendFailedJSonResponse(res, { statusCode: 403, message: "Student authentication required" });
  }

  const result = await NotificationService.getNotifications({
    recipientId: req.user.id,
    schoolId: req.user.school_id,
    is_read: is_read !== undefined ? is_read === "true" : null,
    category,
    type,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Notifications retrieved",
    data: result.data.notifications,
    pagination: result.data.pagination,
  });
});

const getUnreadCount = asyncHandler(async (req, res, next) => {
  if (req.user.auth_type !== "student") {
    return sendFailedJSonResponse(res, { statusCode: 403, message: "Student authentication required" });
  }

  const result = await NotificationService.getUnreadCount(req.user.id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Unread count retrieved",
    data: result.data,
  });
});

const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.user.auth_type !== "student") {
    return sendFailedJSonResponse(res, { statusCode: 403, message: "Student authentication required" });
  }

  const result = await NotificationService.markAsRead(id, req.user.id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Notification marked as read",
    data: result.data,
  });
});

const markAllAsRead = asyncHandler(async (req, res, next) => {
  if (req.user.auth_type !== "student") {
    return sendFailedJSonResponse(res, { statusCode: 403, message: "Student authentication required" });
  }

  const result = await NotificationService.markAllAsRead(req.user.id, req.user.school_id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "All notifications marked as read",
    data: result.data,
  });
});

const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.user.auth_type !== "student") {
    return sendFailedJSonResponse(res, { statusCode: 403, message: "Student authentication required" });
  }

  const result = await NotificationService.deleteNotification(id, req.user.id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Notification deleted",
    data: result.data,
  });
});

const deleteAllNotifications = asyncHandler(async (req, res, next) => {
  if (req.user.auth_type !== "student") {
    return sendFailedJSonResponse(res, { statusCode: 403, message: "Student authentication required" });
  }

  const result = await NotificationService.deleteAllNotifications(req.user.id, req.user.school_id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "All notifications deleted",
    data: result.data,
  });
});

const { sendFailedJSonResponse } = require("../../utils/responseHelpers");

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};