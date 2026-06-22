const ExamService = require('../services/ExamService');
const logger = require('../utils/logger');

const list = async (req, res) => {
  try {
    const { page, limit, q } = req.query;
    const data = await ExamService.listExams({ page, limit, query: q });
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('ExamController.list error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

/**
 * Get all exams for select dropdowns (cached)
 */
const getAllExams = async (req, res) => {
  try {
    const exams = await ExamService.getAllExams();
    return res.json({ success: true, data: exams });
  } catch (err) {
    logger.error('ExamController.getAllExams error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const exam = await ExamService.getExam(id);
    return res.json({ success: true, data: exam });
  } catch (err) {
    logger.error('ExamController.get error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const save = async (req, res) => {
  try {
    const payload = req.body || {};
    let saved;
    if (payload.id) saved = await ExamService.updateExam(payload.id, payload);
    else saved = await ExamService.createExam(payload);
    return res.json({ success: true, data: saved });
  } catch (err) {
    logger.error('ExamController.save error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await ExamService.deleteExam(id);
    return res.json({ success: true });
  } catch (err) {
    logger.error('ExamController.remove error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};



const initializeResults = async (req, res) => {
  try {
    const examId = Number(req.params.id);
    const { course_id } = req.body || {};
    const count = await ExamService.initializeResults(examId, course_id);
    return res.json({ success: true, data: { created: count } });
  } catch (err) {
    logger.error('ExamController.initializeResults error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

module.exports = { list, getAllExams, get, save, remove };
