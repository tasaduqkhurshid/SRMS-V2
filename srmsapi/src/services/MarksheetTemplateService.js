"use strict";

const ModelUtils = require("../utils/ModelUtils");
const { MarksheetTemplate } = require("../db/models");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");
const { MARKSHEET_ENTITIES, normalizeTemplateEntities } = require("./marksheetTemplateEntities");

const getMarksheetEntityCatalog = () => success(MARKSHEET_ENTITIES);

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
    let entities;
    try { entities = normalizeTemplateEntities(payload.entities); }
    catch (error) { throw new ValidationError(error.message); }
    const template = await ModelUtils.createAndReturn(MarksheetTemplate, {
      name: payload.name,
      html_content: payload.html_content,
      is_active: payload.is_active,
      entities,
    });
    return success(template);
  } catch (error) {
    return failure(error);
  }
};

const updateMarksheetTemplate = async (id, payload) => {
  try {
    if (!id) return success(null);
    const updates = {};
    for (const field of ["name", "html_content", "is_active"]) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) updates[field] = payload[field];
    }
    if (Object.prototype.hasOwnProperty.call(payload, "entities")) {
      try { updates.entities = normalizeTemplateEntities(payload.entities); }
      catch (error) { throw new ValidationError(error.message); }
    }
    const updated = await ModelUtils.updateAndReturn(MarksheetTemplate, { _id: id }, updates);
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
  getMarksheetEntityCatalog,
  listMarksheetTemplates,
  getMarksheetTemplateById,
  createMarksheetTemplate,
  updateMarksheetTemplate,
  deleteMarksheetTemplate,
};
