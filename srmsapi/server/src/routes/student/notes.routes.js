const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/notes.controller');

router.get('/', controller.getNotes);

module.exports = router;
