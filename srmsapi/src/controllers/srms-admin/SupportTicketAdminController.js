"use strict";

const SupportTicketService = require("../../services/common/SupportTicketService");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");
const { ValidationError, NotFoundError, AuthorizationError } = require("../../utils/applicationErrors");
const multer = require("multer");

const allowedFileTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => callback(
    allowedFileTypes.has(file.mimetype)
      ? null
      : new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF, TXT, DOC, DOCX'),
    allowedFileTypes.has(file.mimetype),
  ),
}).array('attachments', 5);

const uploadAttachments = (req, res, next) => upload(req, res, (error) => {
  if (!error) return next();
  const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  return res.status(status).json({ 
    status: 'error', 
    success: false, 
    code: 'UPLOAD_ERROR',
    message: status === 413 ? 'Files must be 10 MB or smaller' : error.message 
  });
});

const listTickets = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const sortBy = req.query.sort_by || 'created_at';
  const sortDirection = req.query.sort_direction === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortDirection };
  
  const filters = {};
  if (req.query.school_id) filters.school_id = req.query.school_id;
  if (req.query.status_id) filters.status_id = req.query.status_id;
  if (req.query.subject_id) filters.subject_id = req.query.subject_id;
  if (req.query.service_id) filters.service_id = req.query.service_id;
  if (req.query.priority) filters.priority = req.query.priority;
  if (req.query.assigned_to) filters.assigned_to = req.query.assigned_to;
  if (req.query.search) filters.search = req.query.search;
  if (req.query.date_from) filters.date_from = req.query.date_from;
  if (req.query.date_to) filters.date_to = req.query.date_to;
  
  const result = await SupportTicketService.getAllTicketsForAdmin({ filters, page, limit, sort });
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Tickets retrieved",
    data: result.data,
  });
});

const getStatistics = asyncHandler(async (req, res, next) => {
  const result = await SupportTicketService.getTicketStatistics(null);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Statistics retrieved",
    data: result.data,
  });
});

const createTicket = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  const { school_id, subject_id, service_id, module, title, description, priority } = req.body;
  
  if (!school_id) throw new ValidationError("School is required");
  if (!subject_id) throw new ValidationError("Subject is required");
  if (!title) throw new ValidationError("Title is required");
  if (!description) throw new ValidationError("Description is required");
  
  // Process attachments if any
  const attachments = [];
  if (req.files && req.files.length > 0) {
    const school = await require("../../db/models").School.findById(school_id).lean();
    if (!school) throw new NotFoundError("School");
    
    for (const file of req.files) {
      const uploadResult = await SupportTicketService.uploadAttachment({
        schoolSlug: school.slug,
        file,
        userId,
      });
      if (uploadResult.error) return next(uploadResult.error);
      attachments.push(uploadResult.data);
    }
  }
  
  const createdBy = {
    user_id: userId,
    name: userName,
    role: userRole,
    portal: 'admin',
  };
  
  const result = await SupportTicketService.createTicketForSchool({
    schoolId: school_id,
    subjectId: subject_id,
    serviceId: service_id || null,
    module: module || '',
    title,
    description,
    priority: priority || 'medium',
    createdBy,
    attachments,
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: "Ticket created successfully",
    data: result.data,
  });
});

const getTicket = asyncHandler(async (req, res, next) => {
  const ticketId = req.params.id;
  const includeInternal = req.query.include_internal === 'true';
  
  const result = await SupportTicketService.getTicketById(ticketId);
  if (result.error) return next(result.error);
  
  // Get messages (including internal notes if admin requests)
  const messagesResult = await SupportTicketService.getTicketMessages({
    ticketId,
    includeInternal,
  });
  if (messagesResult.error) return next(messagesResult.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Ticket retrieved",
    data: {
      ticket: result.data,
      messages: messagesResult.data,
    },
  });
});

const addReply = asyncHandler(async (req, res, next) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  const { message, message_type } = req.body;
  if (!message || !message.trim()) {
    throw new ValidationError("Message is required");
  }
  
  const type = message_type || 'reply';
  if (type === 'internal_note' && !['SUPER_ADMIN'].includes(userRole)) {
    throw new AuthorizationError("Only super admin can add internal notes");
  }
  
  // Process attachments if any
  const attachments = [];
  if (req.files && req.files.length > 0) {
    const ticket = await require("../../db/models").SupportTicket.findById(ticketId).lean();
    if (!ticket) throw new NotFoundError("Ticket");
    
    const school = await require("../../db/models").School.findById(ticket.school_id).lean();
    if (!school) throw new NotFoundError("School");
    
    for (const file of req.files) {
      const uploadResult = await SupportTicketService.uploadAttachment({
        schoolSlug: school.slug,
        file,
        userId,
      });
      if (uploadResult.error) return next(uploadResult.error);
      attachments.push(uploadResult.data);
    }
  }
  
  const result = await SupportTicketService.addReply({
    ticketId,
    schoolId: null, // Admin can reply to any ticket
    senderId: userId,
    senderName: userName,
    senderRole: userRole,
    senderPortal: 'admin',
    message: message.trim(),
    messageType: type,
    attachments,
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: type === 'internal_note' ? "Internal note added" : "Reply added",
    data: result.data,
  });
});

const changeStatus = asyncHandler(async (req, res, next) => {
  const ticketId = req.params.id;
  const { status_id } = req.body;
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  if (!status_id) throw new ValidationError("Status is required");
  
  const result = await SupportTicketService.changeTicketStatus({
    ticketId,
    statusId: status_id,
    userId,
    userName,
    userRole,
    userPortal: 'admin',
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Status updated successfully",
    data: result.data,
  });
});

const resolveTicket = asyncHandler(async (req, res, next) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  const result = await SupportTicketService.resolveTicket({
    ticketId,
    userId,
    userName,
    userRole,
    userPortal: 'admin',
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Ticket resolved",
    data: result.data,
  });
});

const reopenTicket = asyncHandler(async (req, res, next) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  const result = await SupportTicketService.reopenTicket({
    ticketId,
    userId,
    userName,
    userRole,
    userPortal: 'admin',
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Ticket reopened",
    data: result.data,
  });
});

const assignTicket = asyncHandler(async (req, res, next) => {
  const ticketId = req.params.id;
  const { assigned_to } = req.body;
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  const result = await SupportTicketService.assignTicket({
    ticketId,
    assignedToId: assigned_to || null,
    userId,
    userName,
    userRole,
    userPortal: 'admin',
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: assigned_to ? "Ticket assigned" : "Ticket unassigned",
    data: result.data,
  });
});

// Subject management
const listSubjects = asyncHandler(async (req, res, next) => {
  const activeOnly = req.query.active_only !== 'false';
  const result = await SupportTicketService.getSubjects(activeOnly);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Subjects retrieved",
    data: result.data,
  });
});

const createSubject = asyncHandler(async (req, res, next) => {
  const { name, code, description, is_active, sort_order } = req.body;
  if (!name || !code) throw new ValidationError("Name and code are required");
  
  const result = await SupportTicketService.createSubject({
    name,
    code: code.toLowerCase().trim(),
    description: description || '',
    is_active: is_active !== false,
    sort_order: sort_order || 0,
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: "Subject created",
    data: result.data,
  });
});

const updateSubject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, code, description, is_active, sort_order } = req.body;
  
  const data = {};
  if (name !== undefined) data.name = name;
  if (code !== undefined) data.code = code.toLowerCase().trim();
  if (description !== undefined) data.description = description;
  if (is_active !== undefined) data.is_active = is_active;
  if (sort_order !== undefined) data.sort_order = sort_order;
  
  const result = await SupportTicketService.updateSubject(id, data);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Subject updated",
    data: result.data,
  });
});

// Service management
const listServices = asyncHandler(async (req, res, next) => {
  const activeOnly = req.query.active_only !== 'false';
  const result = await SupportTicketService.getServices(activeOnly);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Services retrieved",
    data: result.data,
  });
});

const createService = asyncHandler(async (req, res, next) => {
  const { name, code, description, is_active, sort_order } = req.body;
  if (!name || !code) throw new ValidationError("Name and code are required");
  
  const result = await SupportTicketService.createService({
    name,
    code: code.toLowerCase().trim(),
    description: description || '',
    is_active: is_active !== false,
    sort_order: sort_order || 0,
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: "Service created",
    data: result.data,
  });
});

const updateService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, code, description, is_active, sort_order } = req.body;
  
  const data = {};
  if (name !== undefined) data.name = name;
  if (code !== undefined) data.code = code.toLowerCase().trim();
  if (description !== undefined) data.description = description;
  if (is_active !== undefined) data.is_active = is_active;
  if (sort_order !== undefined) data.sort_order = sort_order;
  
  const result = await SupportTicketService.updateService(id, data);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Service updated",
    data: result.data,
  });
});

// Status management
const listStatuses = asyncHandler(async (req, res, next) => {
  const activeOnly = req.query.active_only !== 'false';
  const result = await SupportTicketService.getStatuses(activeOnly);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Statuses retrieved",
    data: result.data,
  });
});

const createStatus = asyncHandler(async (req, res, next) => {
  const { name, code, description, color, is_active, is_terminal, sort_order } = req.body;
  if (!name || !code) throw new ValidationError("Name and code are required");
  
  const result = await SupportTicketService.createStatus({
    name,
    code: code.toLowerCase().trim(),
    description: description || '',
    color: color || '#6B7280',
    is_active: is_active !== false,
    is_terminal: is_terminal === true,
    sort_order: sort_order || 0,
    is_system: false,
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: "Status created",
    data: result.data,
  });
});

const updateStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, code, description, color, is_active, is_terminal, sort_order } = req.body;
  
  const data = {};
  if (name !== undefined) data.name = name;
  if (code !== undefined) data.code = code.toLowerCase().trim();
  if (description !== undefined) data.description = description;
  if (color !== undefined) data.color = color;
  if (is_active !== undefined) data.is_active = is_active;
  if (is_terminal !== undefined) data.is_terminal = is_terminal;
  if (sort_order !== undefined) data.sort_order = sort_order;
  
  const result = await SupportTicketService.updateStatus(id, data);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Status updated",
    data: result.data,
  });
});

module.exports = {
  listTickets,
  getStatistics,
  createTicket,
  getTicket,
  addReply,
  changeStatus,
  resolveTicket,
  reopenTicket,
  assignTicket,
  listSubjects,
  createSubject,
  updateSubject,
  listServices,
  createService,
  updateService,
  listStatuses,
  createStatus,
  updateStatus,
  uploadAttachments,
};