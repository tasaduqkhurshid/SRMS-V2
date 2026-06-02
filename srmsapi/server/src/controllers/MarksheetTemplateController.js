const MarksheetTemplateService = require('../services/MarksheetTemplateService');
const logger = require('../utils/logger');

const list = async (req, res) => {
  try {
    const { page, limit, q } = req.query;
    const data = await MarksheetTemplateService.listMarksheetTemplates({ page, limit, query: q });
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('MarksheetTemplateController.list error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await MarksheetTemplateService.getTemplateById(id);
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('MarksheetTemplateController.get error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const save = async (req, res) => {
  try {
    const payload = req.body || {};
    let saved;
    if (payload.id) {
      saved = await MarksheetTemplateService.updateMarksheetTemplate(payload.id, payload);
    } else {
      saved = await MarksheetTemplateService.createMarksheetTemplate(payload);
    }
    return res.json({ success: true, data: saved });
  } catch (err) {
    logger.error('MarksheetTemplateController.save error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await MarksheetTemplateService.deleteMarksheetTemplate(id);
    return res.json({ success: true });
  } catch (err) {
    logger.error('MarksheetTemplateController.remove error', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

module.exports = { list, get, save, remove };
