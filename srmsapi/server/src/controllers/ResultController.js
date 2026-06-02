const ResultService = require('../services/ResultService');
const logger = require('../utils/logger');
const STATUS = require('../constants/status');

const list = async (req, res) => {
  try {
    const { page, limit, student_id, course_id, subject_id, exam_id, academic_year_id } = req.query;
    const data = await ResultService.listResultsByFilters({ page, limit, student_id, course_id, subject_id, exam_id, academic_year_id });
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('ResultController.list error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await ResultService.getResultById(id);
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('ResultController.get error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const save = async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('ResultController.save payload:', JSON.stringify(payload, null, 2));
    
    // Validate required fields
    if (!payload.student_id || !payload.subject_id || !payload.exam_id || !payload.academic_year_id) {
      const missing = [];
      if (!payload.student_id) missing.push('student_id');
      if (!payload.subject_id) missing.push('subject_id');
      if (!payload.exam_id) missing.push('exam_id');
      if (!payload.academic_year_id) missing.push('academic_year_id');
      return res.status(400).json({ success: false, error: `Missing required fields: ${missing.join(', ')}` });
    }
    
    let saved;
    if (payload.id) {
      saved = await ResultService.updateResultById(payload.id, payload);
    } else {
      saved = await ResultService.createNewResult(payload);
    }
    return res.json({ success: true, data: saved });
  } catch (err) {
    logger.error('ResultController.save error', err);
    console.error('ResultController.save error details:', err.message, err.errors);
    return res.status(500).json({ success: false, error: err.message || 'Server error', details: err.errors });
  }
};

const bulkSave = async (req, res) => {
  try {
    const { rows, academic_year_id } = req.body || {};
    let schoolId = null;
    if (req.user) schoolId = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, error: 'rows array is required' });
    }

    if (!academic_year_id) {
      return res.status(400).json({ success: false, error: 'academic_year_id is required' });
    }

    const saved = await ResultService.bulkUpsertResults(rows, schoolId, academic_year_id);
    return res.json({ success: true, data: { created_count: saved.length, results: saved } });
  } catch (err) {
    logger.error('ResultController.bulkSave error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await ResultService.deleteResultById(id);
    return res.json({ success: true });
  } catch (err) {
    logger.error('ResultController.remove error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const generateMarksheet = async (req, res) => {
  try {
    const { student_id, exam_ids, template_id, academic_year_id } = req.body;
    
    // Validate required fields
    if (!student_id || !exam_ids || !Array.isArray(exam_ids) || exam_ids.length === 0 || !template_id) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: student_id, exam_ids (array), template_id'
      });
    }

    const result = await ResultService.generateCompleteMarksheet(
      Number(student_id),
      exam_ids.map(id => Number(id)),
      Number(template_id),
      academic_year_id ? Number(academic_year_id) : null
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        details: result.details || null
      });
    }

    return res.json({
      success: true,
      data: result.data,
      html: result.data?.html
    });
  } catch (err) {
    logger.error('ResultController.generateMarksheet error', err);
    console.error('Error details:', err.message, err.stack);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

module.exports = { list, get, save, bulkSave, remove, generateMarksheet };
