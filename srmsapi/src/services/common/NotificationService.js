"use strict";

const { Notification, User, School, Student } = require("../../db/models");
const ModelUtils = require("../../utils/ModelUtils");
const { ValidationError, NotFoundError, AuthorizationError } = require("../../utils/applicationErrors");
const { success, failure } = require("../../utils/serviceResult");

const VALID_TYPES = ["info", "success", "warning", "error"];
const VALID_CATEGORIES = [
  "academic",
  "student",
  "examination",
  "result",
  "attendance",
  "fees",
  "system",
  "support",
  "admission",
  "announcement",
];
const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"];

const getSocketService = () => {
  try {
    return require("./SocketService");
  } catch (_error) {
    return null;
  }
};

const emitNotification = async (notification) => {
  const socketService = getSocketService();
  if (socketService && socketService.emitToUser) {
    socketService.emitToUser(notification.recipient.toString(), "notification:new", notification);
  }
};

const emitUnreadCountUpdate = async (recipientId) => {
  const socketService = getSocketService();
  if (socketService && socketService.emitToUser) {
    const count = await Notification.countDocuments({ recipient: recipientId, isRead: false });
    socketService.emitToUser(recipientId.toString(), "notification:count-updated", { unreadCount: count });
  }
};

const validateRecipient = async (recipientId) => {
  const user = await ModelUtils.findOne(User, { _id: recipientId });
  if (!user) {
    throw new ValidationError("Recipient user not found");
  }
  return user;
};

const validateSchool = async (schoolId) => {
  if (!schoolId) return null;
  const school = await ModelUtils.findOne(School, { _id: schoolId });
  if (!school) {
    throw new ValidationError("School not found");
  }
  return school;
};

const createNotification = async ({
  recipient,
  recipientRole,
  schoolId = null,
  title,
  message,
  type = "info",
  category = "system",
  referenceId = null,
  referenceModel = null,
  actionUrl = null,
}) => {
  try {
    if (!recipient) throw new ValidationError("Recipient is required");
    if (!recipientRole) throw new ValidationError("Recipient role is required");
    if (!VALID_ROLES.includes(recipientRole)) {
      throw new ValidationError(`Invalid recipient role. Must be one of: ${VALID_ROLES.join(", ")}`);
    }
    if (!title || !title.trim()) throw new ValidationError("Title is required");
    if (!message || !message.trim()) throw new ValidationError("Message is required");
    if (!VALID_TYPES.includes(type)) throw new ValidationError(`Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`);
    if (!VALID_CATEGORIES.includes(category)) throw new ValidationError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`);

    await validateRecipient(recipient);
    await validateSchool(schoolId);

    const notification = await ModelUtils.createAndReturn(Notification, {
      recipient,
      recipientRole,
      school_id: schoolId,
      title: title.trim(),
      message: message.trim(),
      type,
      category,
      reference_id: referenceId,
      reference_model: referenceModel,
      action_url: actionUrl,
      is_read: false,
    });

    await emitNotification(notification);
    await emitUnreadCountUpdate(recipient);

    return success(notification);
  } catch (error) {
    return failure(error);
  }
};

const createBulkNotifications = async (notifications) => {
  try {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      throw new ValidationError("Notifications array is required and cannot be empty");
    }

    const createdNotifications = [];
    const recipientIds = new Set();

    for (const notif of notifications) {
      if (!notif.recipient) throw new ValidationError("Recipient is required for all notifications");
      if (!notif.recipientRole) throw new ValidationError("Recipient role is required for all notifications");
      if (!VALID_ROLES.includes(notif.recipientRole)) {
        throw new ValidationError(`Invalid recipient role: ${notif.recipientRole}`);
      }
      if (!notif.title || !notif.title.trim()) throw new ValidationError("Title is required for all notifications");
      if (!notif.message || !notif.message.trim()) throw new ValidationError("Message is required for all notifications");
      if (!VALID_TYPES.includes(notif.type || "info")) throw new ValidationError(`Invalid type: ${notif.type}`);
      if (!VALID_CATEGORIES.includes(notif.category || "system")) throw new ValidationError(`Invalid category: ${notif.category}`);

      recipientIds.add(notif.recipient.toString());
      await validateRecipient(notif.recipient);
      if (notif.schoolId) await validateSchool(notif.schoolId);

      const created = await ModelUtils.createAndReturn(Notification, {
        recipient: notif.recipient,
        recipientRole: notif.recipientRole,
        schoolId: notif.schoolId || null,
        title: notif.title.trim(),
        message: notif.message.trim(),
        type: notif.type || "info",
        category: notif.category || "system",
        referenceId: notif.referenceId || null,
        referenceModel: notif.referenceModel || null,
        actionUrl: notif.actionUrl || null,
        isRead: false,
      });

      if (created) {
        createdNotifications.push(created);
      }
    }

    for (const notification of createdNotifications) {
      await emitNotification(notification);
    }

    for (const recipientId of recipientIds) {
      await emitUnreadCountUpdate(recipientId);
    }

    return success(createdNotifications);
  } catch (error) {
    return failure(error);
  }
};

const getNotifications = async ({
  recipientId,
  schoolId = null,
  isRead = false,
  category = null,
  type = null,
  page = 1,
  limit = 20,
  sort = { created_at: -1 },
}) => {
  try {
    const where = { recipient: recipientId };

    if (schoolId) where.schoolId = schoolId;
    where.isRead = isRead;
    if (category) where.category = category;
    if (type) where.type = type;

    const result = await ModelUtils.findAndCountAll(Notification, where, {
      sort,
      skip: (page - 1) * limit,
      limit,
    });
   

    return success({
      notifications: result.rows,
      pagination: {
        page,
        limit,
        total: result.count,
        pages: Math.ceil(result.count / limit),
      },
    });
  } catch (error) {
    return failure(error);
  }
};

const getUnreadCount = async (recipientId) => {
  try {
    const count = await Notification.countDocuments({ recipient: recipientId, isRead: false });
    return success({ unreadCount: count });
  } catch (error) {
    return failure(error);
  }
};

const markAsRead = async (notificationId, recipientId) => {
  try {
    const notification = await ModelUtils.findOne(Notification, { _id: notificationId, recipient: recipientId });
    if (!notification) {
      throw new NotFoundError("Notification");
    }

    if (notification.is_read) {
      return success(notification);
    }

    const updated = await ModelUtils.updateAndReturn(Notification, { _id: notificationId }, { isRead: true, readAt: new Date() });
    const updatedNotification = updated.rows?.[0] || updated;

    await emitUnreadCountUpdate(recipientId);

    const socketService = getSocketService();
    if (socketService && socketService.emitToUser) {
      socketService.emitToUser(recipientId.toString(), "notification:read", { notificationId, readAt: updatedNotification.read_at });
    }

    return success(updatedNotification);
  } catch (error) {
    return failure(error);
  }
};

const markAllAsRead = async (recipientId, schoolId = null) => {
  try {
    const where = { recipient: recipientId, is_read: false };
    if (schoolId) where.school_id = schoolId;

    await Notification.updateMany(where, { $set: { isRead: true, readAt: new Date() } });

    await emitUnreadCountUpdate(recipientId);

    const socketService = getSocketService();
    if (socketService && socketService.emitToUser) {
      socketService.emitToUser(recipientId.toString(), "notification:read-all", { schoolId });
    }

    return success({ marked: true });
  } catch (error) {
    return failure(error);
  }
};

const deleteNotification = async (notificationId, recipientId) => {
  try {
    const notification = await ModelUtils.findOne(Notification, { _id: notificationId, recipient: recipientId });
    if (!notification) {
      throw new NotFoundError("Notification");
    }

    await Notification.deleteOne({ _id: notificationId });

    await emitUnreadCountUpdate(recipientId);

    return success({ deleted: true });
  } catch (error) {
    return failure(error);
  }
};

const deleteAllNotifications = async (recipientId, schoolId = null) => {
  try {
    const where = { recipient: recipientId };
    if (schoolId) where.school_id = schoolId;

    const result = await Notification.deleteMany(where);

    await emitUnreadCountUpdate(recipientId);

    return success({ deletedCount: result.deletedCount });
  } catch (error) {
    return failure(error);
  }
};

const createSystemAnnouncement = async ({
  title,
  message,
  type = "info",
  category = "announcement",
  schoolId = null,
  actionUrl = null,
  targetRoles = ["ADMIN", "SCHOOL_ADMIN"],
}) => {
  try {
    const where = { role: { $in: targetRoles } };
    if (schoolId) where.school_id = schoolId;

    const users = await ModelUtils.findAll(User, where);

    if (users.length === 0) {
      return success({ created: 0, message: "No recipients found" });
    }

    const notifications = users.map((user) => ({
      recipient: user._id,
      recipientRole: user.role,
      schoolId: user.school_id,
      title,
      message,
      type,
      category,
      actionUrl,
    }));

    return createBulkNotifications(notifications);
  } catch (error) {
    return failure(error);
  }
};

const createStudentNotification = async ({
  studentId,
  schoolId,
  title,
  message,
  type = "info",
  category = "student",
  actionUrl = null,
}) => {
  try {
    const student = await ModelUtils.findOne(Student, { _id: studentId, school_id: schoolId });
    if (!student) {
      throw new NotFoundError("Student");
    }

    const user = await ModelUtils.findOne(User, { student_id: studentId });
    if (!user) {
      throw new ValidationError("Student user account not found");
    }

    return createNotification({
      recipient: user._id,
      recipientRole: "STUDENT",
      schoolId,
      title,
      message,
      type,
      category,
      actionUrl,
    });
  } catch (error) {
    return failure(error);
  }
};

const createParentNotification = async ({
  studentId,
  schoolId,
  title,
  message,
  type = "info",
  category = "student",
  actionUrl = null,
}) => {
  try {
    const student = await ModelUtils.findOne(Student, { _id: studentId, school_id: schoolId });
    if (!student) {
      throw new NotFoundError("Student");
    }

    const parents = await ModelUtils.findAll(User, {
      linked_student_ids: studentId,
      role: "PARENT",
      school_id: schoolId,
    });

    if (parents.length === 0) {
      return success({ created: 0, message: "No parent accounts linked" });
    }

    const notifications = parents.map((parent) => ({
      recipient: parent._id,
      recipientRole: "PARENT",
      schoolId,
      title,
      message,
      type,
      category,
      actionUrl,
    }));

    return createBulkNotifications(notifications);
  } catch (error) {
    return failure(error);
  }
};

const createSchoolAdminNotification = async ({
  schoolId,
  title,
  message,
  type = "info",
  category = "system",
  actionUrl = null,
  excludeUserId = null,
}) => {
  try {
    const where = {
      school_id: schoolId,
      role: { $in: ["ADMIN", "SCHOOL_ADMIN"] },
    };
    if (excludeUserId) where._id = { $ne: excludeUserId };

    const admins = await ModelUtils.findAll(User, where);

    if (admins.length === 0) {
      return success({ created: 0, message: "No school admins found" });
    }

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      recipientRole: admin.role,
      schoolId,
      title,
      message,
      type,
      category,
      actionUrl,
    }));

    return createBulkNotifications(notifications);
  } catch (error) {
    return failure(error);
  }
};

const createSuperAdminNotification = async ({
  title,
  message,
  type = "info",
  category = "system",
  actionUrl = null,
}) => {
  try {
    const superAdmins = await ModelUtils.findAll(User, { role: "SUPER_ADMIN", school_id: null });

    if (superAdmins.length === 0) {
      return success({ created: 0, message: "No super admins found" });
    }

    const notifications = superAdmins.map((admin) => ({
      recipient: admin._id,
      recipientRole: "SUPER_ADMIN",
      schoolId: null,
      title,
      message,
      type,
      category,
      actionUrl,
    }));

    return createBulkNotifications(notifications);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createSystemAnnouncement,
  createStudentNotification,
  createParentNotification,
  createSchoolAdminNotification,
  createSuperAdminNotification,
  VALID_TYPES,
  VALID_CATEGORIES,
  VALID_ROLES,
};