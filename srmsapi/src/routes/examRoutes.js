const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/ExamController');

// list & search (paginated)
router.get('/', ExamController.listExams);
router.get('/:id', ExamController.getExam);
router.post('/save', ExamController.saveExam);
// router.post('/duplicate', ExamController.duplicate);
// router.post('/:id/initialize-results', ExamController.initializeResults);
router.delete('/:id', ExamController.deleteExam);

module.exports = router;