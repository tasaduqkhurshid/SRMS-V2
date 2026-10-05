const express = require('express');
const router = express.Router();
const { authenticateJwt, requireStudentAuth } = require('../../middleware/AuthService');
const authController = require('../../controllers/student/auth.controller');

router.get('/school/brand', authController.getSchoolBrand);
router.get('/manifest', authController.manifest);
router.use('/auth', require('./auth.routes'));
router.use(authenticateJwt, requireStudentAuth);
router.use('/dashboard', require('./dashboard.routes'));
router.use('/profile', require('./profile.routes'));
router.use('/results', require('./results.routes'));
router.use('/performance', require('./performance.routes'));
router.use('/fees', require('./fees.routes'));
router.use('/attendance', require('./attendance.routes'));
router.use('/lectures', require('./lectures.routes'));
router.use('/notes', require('./notes.routes'));
router.use('/notifications', require('./notifications.routes'));

module.exports = router;
