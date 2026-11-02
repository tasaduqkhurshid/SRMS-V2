"use strict";

const { SupportTicket, SupportTicketMessage, SupportTicketSubject, SupportTicketService, SupportTicketStatus, SupportTicketCounter, School, User } = require("../db/models");
const ModelUtils = require("../utils/ModelUtils");
const { ValidationError, NotFoundError, ConflictError, AuthorizationError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");
const storage = require("./storage/storage.service");

const TICKET_NUMBER_PREFIX = "SRMS";

const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  
  const counter = await SupportTicketCounter.findOneAndUpdate(
    { year },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  const sequence = String(counter.sequence).padStart(6, '0');
  return `${TICKET_NUMBER_PREFIX}-${year}-${sequence}`;
};

const getInitialStatus = async () => {
  const status = await ModelUtils.findOne(SupportTicketStatus, { code: 'pending', is_active: true });
  if (!status) {
    throw new ValidationError("Default status 'Pending' not found or inactive");
  }
  return status;
};

const validateSubject = async (subjectId) => {
  const subject = await ModelUtils.findOne(SupportTicketSubject, { _id: subjectId, is_active: true });
  if (!subject) {
    throw new ValidationError("Subject not found or inactive");
  }
  return subject;
};

const validateService = async (serviceId) => {
  if (!serviceId) return null;
  const service = await ModelUtils.findOne(SupportTicketService, { _id: serviceId, is_active: true });
  if (!service) {
    throw new ValidationError("Service not found or inactive");
  }
  return service;
};

const validateStatus = async (statusId) => {
  const status = await ModelUtils.findOne(SupportTicketStatus, { _id: statusId, is_active: true });
  if (!status) {
    throw new ValidationError("Status not found or inactive");
  }
  return status;
};

const validateSchool = async (schoolId) => {
  const school = await ModelUtils.findOne(School, { _id: schoolId });
  if (!school) {
    throw new NotFoundError("School");
  }
  return school;
};

const createTicket = async ({ schoolId, subjectId, serviceId, module, title, description, priority, createdBy, attachments = [] }) => {
  try {
    await validateSchool(schoolId);
    await validateSubject(subjectId);
    await validateService(serviceId);
    
    const initialStatus = await getInitialStatus();
    const ticketNumber = await generateTicketNumber();
    
    const ticket = await ModelUtils.createAndReturn(SupportTicket, {
      ticket_number: ticketNumber,
      school_id: schoolId,
      subject_id: subjectId,
      service_id: serviceId || null,
      module: module || '',
      title,
      description,
      status_id: initialStatus._id,
      priority: priority || 'medium',
      created_by: createdBy,
    });
    
    // Create initial message from description
    await ModelUtils.createAndReturn(SupportTicketMessage, {
      ticket_id: ticket._id,
      school_id: schoolId,
      sender_id: createdBy.user_id,
      sender_name: createdBy.name,
      sender_role: createdBy.role,
      sender_portal: createdBy.portal,
      message: description,
      message_type: 'reply',
      attachments: attachments || [],
    });
    
    // Update ticket with last reply info
    await SupportTicket.updateOne(
      { _id: ticket._id },
      { $set: { last_reply_at: new Date(), last_reply_by: createdBy.user_id } }
    );
    
    return success(ticket);
  } catch (error) {
    return failure(error);
  }
};

const createTicketForSchool = async ({ schoolId, subjectId, serviceId, module, title, description, priority, createdBy, attachments = [] }) => {
  return createTicket({ schoolId, subjectId, serviceId, module, title, description, priority, createdBy, attachments });
};

const getTicketList = async ({ schoolId, filters = {}, page = 1, limit = 20, sort = { created_at: -1 } }) => {
  try {
    const where = { school_id: schoolId };
    
    if (filters.status_id) where.status_id = filters.status_id;
    if (filters.subject_id) where.subject_id = filters.subject_id;
    if (filters.service_id) where.service_id = filters.service_id;
    if (filters.priority) where.priority = filters.priority;
    if (filters.search) {
      where.$or = [
        { ticket_number: { $regex: filters.search, $options: 'i' } },
        { title: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.date_from || filters.date_to) {
      where.created_at = {};
      if (filters.date_from) where.created_at.$gte = new Date(filters.date_from);
      if (filters.date_to) where.created_at.$lte = new Date(filters.date_to);
    }
    
    const include = [
      { model: SupportTicketSubject, as: 'subject_id', attributes: ['_id', 'name', 'code'] },
      { model: SupportTicketService, as: 'service_id', attributes: ['_id', 'name', 'code'] },
      { model: SupportTicketStatus, as: 'status_id', attributes: ['_id', 'name', 'code', 'color'] },
    ];
    
    const result = await ModelUtils.findAndCountAll(SupportTicket, where, {
      include,
      sort,
      skip: (page - 1) * limit,
      limit,
    });
    
    return success({
      tickets: result.rows,
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

const getAllTicketsForAdmin = async ({ filters = {}, page = 1, limit = 20, sort = { created_at: -1 } }) => {
  try {
    const where = {};
    
    if (filters.school_id) where.school_id = filters.school_id;
    if (filters.status_id) where.status_id = filters.status_id;
    if (filters.subject_id) where.subject_id = filters.subject_id;
    if (filters.service_id) where.service_id = filters.service_id;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigned_to) where.assigned_to = filters.assigned_to;
    if (filters.search) {
      where.$or = [
        { ticket_number: { $regex: filters.search, $options: 'i' } },
        { title: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.date_from || filters.date_to) {
      where.created_at = {};
      if (filters.date_from) where.created_at.$gte = new Date(filters.date_from);
      if (filters.date_to) where.created_at.$lte = new Date(filters.date_to);
    }
    
    const include = [
      { model: SupportTicketSubject, as: 'subject_id', attributes: ['_id', 'name', 'code'] },
      { model: SupportTicketService, as: 'service_id', attributes: ['_id', 'name', 'code'] },
      { model: SupportTicketStatus, as: 'status_id', attributes: ['_id', 'name', 'code', 'color'] },
      { model: School, as: 'school_id', attributes: ['_id', 'school_name', 'school_code', 'slug'] },
    ];
    
    const result = await ModelUtils.findAndCountAll(SupportTicket, where, {
      include,
      sort,
      skip: (page - 1) * limit,
      limit,
    });
    
    return success({
      tickets: result.rows,
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

const getTicketById = async (ticketId, schoolId = null) => {
  try {
    const where = { _id: ticketId };
    if (schoolId) where.school_id = schoolId;
    
    const include = [
      { model: SupportTicketSubject, as: 'subject_id', attributes: ['_id', 'name', 'code'] },
      { model: SupportTicketService, as: 'service_id', attributes: ['_id', 'name', 'code'] },
      { model: SupportTicketStatus, as: 'status_id', attributes: ['_id', 'name', 'code', 'color', 'is_terminal'] },
      { model: School, as: 'school_id', attributes: ['_id', 'school_name', 'school_code', 'slug'] },
    ];
    
    const ticket = await ModelUtils.findOne(SupportTicket, where, { include });
    if (!ticket) {
      throw new NotFoundError("Ticket");
    }
    
    return success(ticket);
  } catch (error) {
    return failure(error);
  }
};

const addReply = async ({ ticketId, schoolId, senderId, senderName, senderRole, senderPortal, message, messageType = 'reply', attachments = [] }) => {
  try {
    const where = { _id: ticketId };
    if (schoolId) where.school_id = schoolId;
    
    const ticket = await ModelUtils.findOne(SupportTicket, where);
    if (!ticket) {
      throw new NotFoundError("Ticket");
    }
    
    // Validate message type
    if (messageType === 'internal_note' && senderPortal !== 'admin') {
      throw new AuthorizationError("Only admin users can add internal notes");
    }
    
    const reply = await ModelUtils.createAndReturn(SupportTicketMessage, {
      ticket_id: ticketId,
      school_id: ticket.school_id,
      sender_id: senderId,
      sender_name: senderName,
      sender_role: senderRole,
      sender_portal: senderPortal,
      message,
      message_type: messageType,
      attachments: attachments || [],
    });
    
    // Update ticket with last reply info
    const updateData = {
      last_reply_at: new Date(),
      last_reply_by: senderId,
    };
    
    // If it's a reply from school and ticket was resolved, we might want to reopen it
    // But per requirements, we'll just update the timestamp
    await SupportTicket.updateOne(
      { _id: ticketId },
      { $set: updateData }
    );
    
    return success(reply);
  } catch (error) {
    return failure(error);
  }
};

const getTicketMessages = async ({ ticketId, schoolId, includeInternal = false }) => {
  try {
    const where = { ticket_id: ticketId };
    if (schoolId) where.school_id = schoolId;
    
    if (!includeInternal) {
      where.message_type = { $ne: 'internal_note' };
    }
    
    const include = [];
    
    const messages = await ModelUtils.findAll(SupportTicketMessage, where, {
      include,
      sort: { created_at: 1 },
    });
    
    return success(messages);
  } catch (error) {
    return failure(error);
  }
};

const changeTicketStatus = async ({ ticketId, statusId, userId, userName, userRole, userPortal }) => {
  try {
    const ticket = await ModelUtils.findOne(SupportTicket, { _id: ticketId });
    if (!ticket) {
      throw new NotFoundError("Ticket");
    }
    
    const newStatus = await validateStatus(statusId);
    const previousStatus = await ModelUtils.findOne(SupportTicketStatus, { _id: ticket.status_id });
    
    // Update ticket status
    await SupportTicket.updateOne(
      { _id: ticketId },
      { $set: { status_id: newStatus._id } }
    );
    
    // Add system activity message
    const statusName = newStatus.name;
    const prevStatusName = previousStatus ? previousStatus.name : 'Unknown';
    await ModelUtils.createAndReturn(SupportTicketMessage, {
      ticket_id: ticketId,
      school_id: ticket.school_id,
      sender_id: userId,
      sender_name: userName,
      sender_role: userRole,
      sender_portal: userPortal,
      message: `Status changed from "${prevStatusName}" to "${statusName}"`,
      message_type: 'system_activity',
      attachments: [],
    });
    
    // If resolving, set resolution metadata
    if (newStatus.is_terminal) {
      await SupportTicket.updateOne(
        { _id: ticketId },
        { $set: { resolved_at: new Date(), resolved_by: userId } }
      );
    } else if (ticket.resolved_at && !newStatus.is_terminal) {
      // Reopening - clear resolution metadata
      await SupportTicket.updateOne(
        { _id: ticketId },
        { $set: { resolved_at: null, resolved_by: null } }
      );
    }
    
    return success({ ticketId, newStatus: newStatus.code });
  } catch (error) {
    return failure(error);
  }
};

const resolveTicket = async ({ ticketId, userId, userName, userRole, userPortal }) => {
  try {
    const resolvedStatus = await ModelUtils.findOne(SupportTicketStatus, { code: 'resolved', is_active: true });
    if (!resolvedStatus) {
      throw new ValidationError("Resolved status not found");
    }
    
    return changeTicketStatus({ ticketId, statusId: resolvedStatus._id, userId, userName, userRole, userPortal });
  } catch (error) {
    return failure(error);
  }
};

const reopenTicket = async ({ ticketId, userId, userName, userRole, userPortal }) => {
  try {
    const pendingStatus = await ModelUtils.findOne(SupportTicketStatus, { code: 'pending', is_active: true });
    if (!pendingStatus) {
      throw new ValidationError("Pending status not found");
    }
    
    return changeTicketStatus({ ticketId, statusId: pendingStatus._id, userId, userName, userRole, userPortal });
  } catch (error) {
    return failure(error);
  }
};

const assignTicket = async ({ ticketId, assignedToId, userId, userName, userRole, userPortal }) => {
  try {
    const ticket = await ModelUtils.findOne(SupportTicket, { _id: ticketId });
    if (!ticket) {
      throw new NotFoundError("Ticket");
    }
    
    const assignedUser = assignedToId ? await ModelUtils.findOne(User, { _id: assignedToId }) : null;
    if (assignedToId && !assignedUser) {
      throw new ValidationError("Assigned user not found");
    }
    
    await SupportTicket.updateOne(
      { _id: ticketId },
      { $set: { assigned_to: assignedToId || null } }
    );
    
    // Add system activity message
    const message = assignedToId 
      ? `Ticket assigned to ${assignedUser?.username || assignedToId}`
      : 'Ticket unassigned';
    await ModelUtils.createAndReturn(SupportTicketMessage, {
      ticket_id: ticketId,
      school_id: ticket.school_id,
      sender_id: userId,
      sender_name: userName,
      sender_role: userRole,
      sender_portal: userPortal,
      message,
      message_type: 'system_activity',
      attachments: [],
    });
    
    return success({ ticketId, assignedTo: assignedToId });
  } catch (error) {
    return failure(error);
  }
};

const getTicketStatistics = async (schoolId = null) => {
  try {
    const match = schoolId ? { school_id: schoolId } : {};
    
    const stats = await SupportTicket.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status_id',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'support_ticket_statuses',
          localField: '_id',
          foreignField: '_id',
          as: 'status',
        },
      },
      { $unwind: '$status' },
      {
        $project: {
          status_code: '$status.code',
          status_name: '$status.name',
          count: 1,
        },
      },
    ]);
    
    const result = {
      total: 0,
      by_status: {},
    };
    
    for (const stat of stats) {
      result.total += stat.count;
      result.by_status[stat.status_code] = {
        name: stat.status_name,
        count: stat.count,
      };
    }
    
    // Add today's tickets
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayMatch = {
      ...match,
      created_at: { $gte: todayStart, $lte: todayEnd },
    };
    const todayCount = await SupportTicket.countDocuments(todayMatch);
    result.created_today = todayCount;
    
    return success(result);
  } catch (error) {
    return failure(error);
  }
};

const getSubjects = async (activeOnly = true) => {
  try {
    const where = activeOnly ? { is_active: true } : {};
    const subjects = await ModelUtils.findAll(SupportTicketSubject, where, {
      sort: { sort_order: 1, name: 1 },
    });
    return success(subjects);
  } catch (error) {
    return failure(error);
  }
};

const getServices = async (activeOnly = true) => {
  try {
    const where = activeOnly ? { is_active: true } : {};
    const services = await ModelUtils.findAll(SupportTicketService, where, {
      sort: { sort_order: 1, name: 1 },
    });
    return success(services);
  } catch (error) {
    return failure(error);
  }
};

const getStatuses = async (activeOnly = true) => {
  try {
    const where = activeOnly ? { is_active: true } : {};
    const statuses = await ModelUtils.findAll(SupportTicketStatus, where, {
      sort: { sort_order: 1, name: 1 },
    });
    return success(statuses);
  } catch (error) {
    return failure(error);
  }
};

const createSubject = async (data) => {
  try {
    const subject = await ModelUtils.createAndReturn(SupportTicketSubject, data);
    return success(subject);
  } catch (error) {
    return failure(error);
  }
};

const updateSubject = async (subjectId, data) => {
  try {
    const result = await ModelUtils.updateAndReturn(SupportTicketSubject, { _id: subjectId }, data);
    return success(result.rows?.[0] || result);
  } catch (error) {
    return failure(error);
  }
};

const createService = async (data) => {
  try {
    const service = await ModelUtils.createAndReturn(SupportTicketService, data);
    return success(service);
  } catch (error) {
    return failure(error);
  }
};

const updateService = async (serviceId, data) => {
  try {
    const result = await ModelUtils.updateAndReturn(SupportTicketService, { _id: serviceId }, data);
    return success(result.rows?.[0] || result);
  } catch (error) {
    return failure(error);
  }
};

const createStatus = async (data) => {
  try {
    const status = await ModelUtils.createAndReturn(SupportTicketStatus, data);
    return success(status);
  } catch (error) {
    return failure(error);
  }
};

const updateStatus = async (statusId, data) => {
  try {
    // Prevent modifying system statuses
    const existing = await ModelUtils.findOne(SupportTicketStatus, { _id: statusId });
    if (existing?.is_system) {
      // Allow only certain fields for system statuses
      const allowedFields = ['name', 'description', 'color', 'sort_order'];
      const filteredData = {};
      for (const key of allowedFields) {
        if (data[key] !== undefined) filteredData[key] = data[key];
      }
      const result = await ModelUtils.updateAndReturn(SupportTicketStatus, { _id: statusId }, filteredData);
      return success(result.rows?.[0] || result);
    }
    
    const result = await ModelUtils.updateAndReturn(SupportTicketStatus, { _id: statusId }, data);
    return success(result.rows?.[0] || result);
  } catch (error) {
    return failure(error);
  }
};

const uploadAttachment = async ({ schoolSlug, file, userId }) => {
  try {
    if (!storage.isConfigured()) {
      throw new ValidationError("Cloud storage is not configured");
    }
    
    const fileName = file.originalname || `attachment-${Date.now()}`;
    const extension = fileName.split('.').pop().toLowerCase();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 80);
    
    const key = `schools/${schoolSlug}/support/${userId}/${Date.now()}-${safeFileName}`;
    
    await storage.uploadFile({
      bucketType: 'private',
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    
    const fileUrl = storage.getPublicUrl(key);
    
    return success({
      file_name: fileName,
      file_url: fileUrl,
      file_key: key,
      mime_type: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    return failure(error);
  }
};

const downloadAttachment = async (key) => {
  try {
    if (!storage.isConfigured()) {
      throw new ValidationError("Cloud storage is not configured");
    }
    
    const file = await storage.getFile(key, 'private');
    return success(file);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  createTicket,
  createTicketForSchool,
  getTicketList,
  getAllTicketsForAdmin,
  getTicketById,
  addReply,
  getTicketMessages,
  changeTicketStatus,
  resolveTicket,
  reopenTicket,
  assignTicket,
  getTicketStatistics,
  getSubjects,
  getServices,
  getStatuses,
  createSubject,
  updateSubject,
  createService,
  updateService,
  createStatus,
  updateStatus,
  uploadAttachment,
  downloadAttachment,
};