const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/fees.controller');

router.get('/', controller.getFees);
router.get('/receipts/:id', controller.getReceipt);
router.post('/accounts/:id/payments', controller.initiatePayment);
router.post('/payments/:id/cancel', controller.cancelPayment);

module.exports = router;
