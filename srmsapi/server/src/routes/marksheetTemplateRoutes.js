const express = require('express');
const router = express.Router();
const MarksheetTemplateController = require('../controllers/MarksheetTemplateController');

router.get('/', MarksheetTemplateController.list);
router.get('/:id', MarksheetTemplateController.get);
router.post('/save', MarksheetTemplateController.save);
router.delete('/:id', MarksheetTemplateController.remove);

module.exports = router;
