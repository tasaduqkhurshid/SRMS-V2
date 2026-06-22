const ModelUtils = require('../utils/ModelUtils');
const { MarksheetTemplate } = require('../db/models');

const listMarksheetTemplates = async ({ page = 1, limit = 50, query = '' } = {}) => {
  const pg = Math.max(1, Number(page || 1));
  const lim = Math.max(1, Number(limit || 50));
  const skip = (pg - 1) * lim;
  const where = {};
  if (query && query.trim()) {
    where.name = new RegExp(query.trim(), 'i');
  }
  const result = await ModelUtils.findAndCountAll(MarksheetTemplate, where, { limit: lim, skip, sort: { _id: -1 } });
  return { meta: { page: pg, limit: lim, total: result.count }, templates: result.rows };
};

const getTemplateById = async (id) => { if (!id) return null; return await ModelUtils.findOne(MarksheetTemplate, { _id: id }); };
const createMarksheetTemplate = async (payload) => { if (!payload) return null; return await ModelUtils.createAndReturn(MarksheetTemplate, payload); };
const updateMarksheetTemplate = async (id, payload) => { if (!id) return null; const updated = await ModelUtils.updateAndReturn(MarksheetTemplate, { _id: id }, payload); if (updated && updated.rows && updated.rows.length) return updated.rows[0]; return await getTemplateById(id); };
const deleteMarksheetTemplate = async (id) => { if (!id) return false; await ModelUtils.remove(MarksheetTemplate, { _id: id }); return true; };

module.exports = { listMarksheetTemplates, getTemplateById, createMarksheetTemplate, updateMarksheetTemplate, deleteMarksheetTemplate };
