const express = require('express');
const router = express.Router();
const controller = require('../../controllers/srms-student/notes.controller');

router.get('/', controller.getNotes);

module.exports = router;
