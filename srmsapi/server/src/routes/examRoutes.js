const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/ExamController');

// list & search (paginated)
router.get('/', ExamController.list);
router.get('/:id', ExamController.get);
router.post('/save', ExamController.save);
// router.post('/duplicate', ExamController.duplicate);
// router.post('/:id/initialize-results', ExamController.initializeResults);
router.delete('/:id', ExamController.remove);

module.exports = router;
