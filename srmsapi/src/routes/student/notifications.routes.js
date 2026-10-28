const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/notifications.controller');

router.get('/', controller.getNotifications);

module.exports = router;
