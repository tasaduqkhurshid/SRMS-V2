"use strict";

const ModelUtils = require("../utils/ModelUtils");
const { MarksheetTemplate } = require("../db/models");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const listMarksheetTemplates = async ({ page = 1, limit = 50, query = "" } = {}) => {
  try {
    const pg = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Number(limit || 50));
    const skip = (pg - 1) * lim;
    const where = {};
    if (query && query.trim()) {
      where.name = new RegExp(query.trim(), "i");
    }
    const result = await ModelUtils.findAndCountAll(MarksheetTemplate, where, { limit: lim, skip, sort: { _id: -1 } });
    return success({ meta: { page: pg, limit: lim, total: result.count }, templates: result.rows });
  } catch (error) {
    return failure(error);
  }
};

const getMarksheetTemplateById = async (id) => {
  try {
    if (!id) return success(null);
    const template = await ModelUtils.findOne(MarksheetTemplate, { _id: id });
    return success(template);
  } catch (error) {
    return failure(error);
  }
};

const createMarksheetTemplate = async (payload) => {
  try {
    if (!payload) return success(null);
    const template = await ModelUtils.createAndReturn(MarksheetTemplate, payload);
    return success(template);
  } catch (error) {
    return failure(error);
  }
};

const updateMarksheetTemplate = async (id, payload) => {
  try {
    if (!id) return success(null);
    const updated = await ModelUtils.updateAndReturn(MarksheetTemplate, { _id: id }, payload);
    if (updated && updated.rows && updated.rows.length) return success(updated.rows[0]);
    return await getMarksheetTemplateById(id);
  } catch (error) {
    return failure(error);
  }
};

const deleteMarksheetTemplate = async (id) => {
  try {
    if (!id) return success(false);
    await ModelUtils.remove(MarksheetTemplate, { _id: id });
    return success(true);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  listMarksheetTemplates,
  getMarksheetTemplateById,
  createMarksheetTemplate,
  updateMarksheetTemplate,
  deleteMarksheetTemplate,
};