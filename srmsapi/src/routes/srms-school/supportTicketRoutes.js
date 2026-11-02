const express = require('express');
const router = express.Router();
const SupportTicketController = require('../../controllers/srms-school/SupportTicketController');
const { authenticateJwt, requireSchoolAdmin } = require('../../middleware/AuthService');

router.use(authenticateJwt, requireSchoolAdmin);

// Statistics
router.get('/support-tickets/statistics', SupportTicketController.getStatistics);

// Subjects, Services, Statuses (for dropdowns)
router.get('/support-ticket-subjects', SupportTicketController.getSubjects);
router.get('/support-ticket-services', SupportTicketController.getServices);
router.get('/support-ticket-statuses', SupportTicketController.getStatuses);

// Ticket CRUD
router.get('/support-tickets', SupportTicketController.listTickets);
router.post('/support-tickets', SupportTicketController.uploadAttachments, SupportTicketController.createTicket);
router.get('/support-tickets/:id', SupportTicketController.getTicket);
router.post('/support-tickets/:id/replies', SupportTicketController.uploadAttachments, SupportTicketController.addReply);

module.exports = router;