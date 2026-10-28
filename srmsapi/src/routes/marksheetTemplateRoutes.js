const express = require('express');
const router = express.Router();
const MarksheetTemplateController = require('../controllers/MarksheetTemplateController');

router.get('/entities', MarksheetTemplateController.listMarksheetEntities);
router.get('/', MarksheetTemplateController.listMarksheetTemplates);
router.get('/:id', MarksheetTemplateController.getMarksheetTemplate);
router.post('/save', MarksheetTemplateController.saveMarksheetTemplate);
router.delete('/:id', MarksheetTemplateController.deleteMarksheetTemplate);

module.exports = router;
