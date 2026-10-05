const express = require('express');
const router = express.Router();
const { authenticateJwt, requireStudentAuth } = require('../../middleware/AuthService');
const controller = require('../../controllers/student/auth.controller');

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticateJwt, requireStudentAuth, controller.me);

module.exports = router;
