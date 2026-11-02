const express = require('express');
const router = express.Router();
const SupportTicketAdminController = require('../../controllers/srms-admin/SupportTicketAdminController');
const { authenticateJwt, requireSuperAdmin } = require('../../middleware/AuthService');

router.use(authenticateJwt, requireSuperAdmin);

// Statistics
router.get('/support-tickets/statistics', SupportTicketAdminController.getStatistics);

// Ticket CRUD
router.get('/support-tickets', SupportTicketAdminController.listTickets);
router.post('/support-tickets', SupportTicketAdminController.uploadAttachments, SupportTicketAdminController.createTicket);
router.get('/support-tickets/:id', SupportTicketAdminController.getTicket);
router.post('/support-tickets/:id/replies', SupportTicketAdminController.uploadAttachments, SupportTicketAdminController.addReply);
router.patch('/support-tickets/:id/status', SupportTicketAdminController.changeStatus);
router.post('/support-tickets/:id/resolve', SupportTicketAdminController.resolveTicket);
router.post('/support-tickets/:id/reopen', SupportTicketAdminController.reopenTicket);
router.patch('/support-tickets/:id/assign', SupportTicketAdminController.assignTicket);

// Subject management
router.get('/support-ticket-subjects', SupportTicketAdminController.listSubjects);
router.post('/support-ticket-subjects', SupportTicketAdminController.createSubject);
router.patch('/support-ticket-subjects/:id', SupportTicketAdminController.updateSubject);

// Service management
router.get('/support-ticket-services', SupportTicketAdminController.listServices);
router.post('/support-ticket-services', SupportTicketAdminController.createService);
router.patch('/support-ticket-services/:id', SupportTicketAdminController.updateService);

// Status management
router.get('/support-ticket-statuses', SupportTicketAdminController.listStatuses);
router.post('/support-ticket-statuses', SupportTicketAdminController.createStatus);
router.patch('/support-ticket-statuses/:id', SupportTicketAdminController.updateStatus);

module.exports = router;