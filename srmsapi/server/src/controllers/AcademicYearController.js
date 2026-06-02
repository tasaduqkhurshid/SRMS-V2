const AcademicYearService = require('../services/AcademicYearService');
const logger = require('../utils/logger');

const list = async (req, res) => {
  try {
    const { page, limit, q } = req.query;
    const data = await AcademicYearService.listAcademicYears({ page, limit, query: q });
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('AcademicYearController.list error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await AcademicYearService.getAcademicYear(id);
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('AcademicYearController.get error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const save = async (req, res) => {
  try {
    const payload = req.body || {};
    let saved;
    if (payload.id) saved = await AcademicYearService.updateAcademicYear(payload.id, payload);
    else saved = await AcademicYearService.createAcademicYear(payload);
    return res.json({ success: true, data: saved });
  } catch (err) {
    logger.error('AcademicYearController.save error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await AcademicYearService.deleteAcademicYear(id);
    return res.json({ success: true });
  } catch (err) {
    logger.error('AcademicYearController.remove error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

/**
 * Get all academic years (for dropdowns/options)
 * No authentication required - used for dynamic option selects
 */
const getAllAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYearService.getAllAcademicYears();
    return res.json({ success: true, data: years });
  } catch (err) {
    logger.error('AcademicYearController.getAllAcademicYears error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

module.exports = { list, get, save, remove, getAllAcademicYears };
