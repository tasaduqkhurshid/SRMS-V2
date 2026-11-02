"use strict";

const SupportTicketService = require("../../services/SupportTicketService");
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
  const schoolId = req.schoolId;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const sortBy = req.query.sort_by || 'created_at';
  const sortDirection = req.query.sort_direction === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortDirection };
  
  const filters = {};
  if (req.query.status_id) filters.status_id = req.query.status_id;
  if (req.query.subject_id) filters.subject_id = req.query.subject_id;
  if (req.query.service_id) filters.service_id = req.query.service_id;
  if (req.query.priority) filters.priority = req.query.priority;
  if (req.query.search) filters.search = req.query.search;
  if (req.query.date_from) filters.date_from = req.query.date_from;
  if (req.query.date_to) filters.date_to = req.query.date_to;
  
  const result = await SupportTicketService.getTicketList({ schoolId, filters, page, limit, sort });
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Tickets retrieved",
    data: result.data,
  });
});

const getStatistics = asyncHandler(async (req, res, next) => {
  const schoolId = req.schoolId;
  
  const result = await SupportTicketService.getTicketStatistics(schoolId);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Statistics retrieved",
    data: result.data,
  });
});

const createTicket = asyncHandler(async (req, res, next) => {
  const schoolId = req.schoolId;
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  const { subject_id, service_id, module, title, description, priority } = req.body;
  
  if (!subject_id) throw new ValidationError("Subject is required");
  if (!title) throw new ValidationError("Title is required");
  if (!description) throw new ValidationError("Description is required");
  
  // Process attachments if any
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await SupportTicketService.uploadAttachment({
        schoolSlug: req.school.slug,
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
    portal: 'school',
  };
  
  const result = await SupportTicketService.createTicket({
    schoolId,
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
  const schoolId = req.schoolId;
  const ticketId = req.params.id;
  
  const result = await SupportTicketService.getTicketById(ticketId, schoolId);
  if (result.error) return next(result.error);
  
  // Get messages (excluding internal notes for school portal)
  const messagesResult = await SupportTicketService.getTicketMessages({
    ticketId,
    schoolId,
    includeInternal: false,
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
  const schoolId = req.schoolId;
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userName = req.user.username;
  const userRole = req.user.role;
  
  const { message } = req.body;
  if (!message || !message.trim()) {
    throw new ValidationError("Message is required");
  }
  
  // Process attachments if any
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await SupportTicketService.uploadAttachment({
        schoolSlug: req.school.slug,
        file,
        userId,
      });
      if (uploadResult.error) return next(uploadResult.error);
      attachments.push(uploadResult.data);
    }
  }
  
  const result = await SupportTicketService.addReply({
    ticketId,
    schoolId,
    senderId: userId,
    senderName: userName,
    senderRole: userRole,
    senderPortal: 'school',
    message: message.trim(),
    messageType: 'reply',
    attachments,
  });
  
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: "Reply added successfully",
    data: result.data,
  });
});

const getSubjects = asyncHandler(async (req, res, next) => {
  const result = await SupportTicketService.getSubjects(true);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Subjects retrieved",
    data: result.data,
  });
});

const getServices = asyncHandler(async (req, res, next) => {
  const result = await SupportTicketService.getServices(true);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Services retrieved",
    data: result.data,
  });
});

const getStatuses = asyncHandler(async (req, res, next) => {
  const result = await SupportTicketService.getStatuses(true);
  if (result.error) return next(result.error);
  
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Statuses retrieved",
    data: result.data,
  });
});

module.exports = {
  listTickets,
  getStatistics,
  createTicket,
  getTicket,
  addReply,
  getSubjects,
  getServices,
  getStatuses,
  uploadAttachments,
};