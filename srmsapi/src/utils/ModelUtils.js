"use strict";
/**
 * ModelUtils.js
 *
 * Generic model utilities for Mongoose models.
 *
 * Usage:
 *   const ModelUtils = require('./utils/ModelUtils');
 *   const users = await ModelUtils.findAll(User, { active: true }, { populate: [...] });
 *
 * Supported call signatures:
 *   - (model, where = {}, options = {})
 *   - (model, options = {}) // where may be inside options.where or just be the filter
 *
 * Notes:
 *  - These helpers intentionally let Mongoose errors bubble so callers can handle them; wrap in try/catch where needed.
 */

const mongoose = require('mongoose');

const normalizeObjectIds = (value, key = '', idContext = false) => {
  const isIdField = idContext || key === '_id' || key.endsWith('_id');
  if (Array.isArray(value)) return value.map(item => normalizeObjectIds(item, key, isIdField));
  if (!value || typeof value !== 'object' || value instanceof mongoose.Types.ObjectId) {
    if (isIdField && mongoose.isValidObjectId(value)) {
      return new mongoose.Types.ObjectId(value);
    }
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      normalizeObjectIds(entryValue, entryKey, isIdField)
    ])
  );
};

/* ------------------ Helpers ------------------ */

/**
 * Helper: Detect whether second argument is an options object (contains populate/select/limit/sort/skip etc.)
 * and normalize to { where, options }.
 */
const normalizeWhereAndOptions = (maybeWhere = {}, maybeOptions = {}) => {
  const looksLikeOptions =
    maybeWhere &&
    typeof maybeWhere === 'object' &&
    (maybeWhere.populate ||
      maybeWhere.select ||
      maybeWhere.limit ||
      maybeWhere.sort ||
      maybeWhere.skip ||
      maybeWhere.where);

  if (looksLikeOptions) {
    const opts = { ...maybeWhere };
    return { where: opts.where || {}, options: opts };
  }

  return { where: maybeWhere || {}, options: { ...(maybeOptions || {}) } };
};

/**
 * Convert Mongoose result(s) to plain JS object(s) safely.
 */
const toPlain = (instance) => {
  if (!instance) return null;
  if (Array.isArray(instance)) {
    return instance.map((r) => (r && typeof r.toObject === 'function' ? r.toObject() : r));
  }
  return typeof instance.toObject === 'function' ? instance.toObject() : instance;
};

/* ------------------ CRUD Utilities ------------------ */

/**
 * Create a record and return the created plain object.
 */
const createAndReturn = async (model, data) => {
  const created = await model.create(data);
  return toPlain(created);
};

/**
 * findOne supports two call signatures:
 *  - findOne(model, where = {}, options = {})
 *  - findOne(model, options = {}) where options may contain `where`, `populate`, `select`, etc.
 *
 * Returns a plain object or null.
 */
const findOne = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);
  const normalizedWhere = normalizeObjectIds(normalized.where);
  let query = model.findOne(normalizedWhere);

  // Apply populate if provided
  if (normalized.options.populate) {
    if (Array.isArray(normalized.options.populate)) {
      normalized.options.populate.forEach(pop => {
        query = query.populate(pop);
      });
    } else {
      query = query.populate(normalized.options.populate);
    }
  }

  // Apply select if provided
  if (normalized.options.select) {
    query = query.select(normalized.options.select);
  }

  const res = await query.lean();
  return res || null;
};

/**
 * findAll supports both (model, where, options) and (model, options) signatures.
 *
 * Returns an array of plain objects (possibly empty).
 */
const findAll = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);
  const normalizedWhere = normalizeObjectIds(normalized.where);
  let query = model.find(normalizedWhere);

  // Apply populate if provided
  if (normalized.options.populate) {
    if (Array.isArray(normalized.options.populate)) {
      normalized.options.populate.forEach(pop => {
        query = query.populate(pop);
      });
    } else {
      query = query.populate(normalized.options.populate);
    }
  }

  // Apply select if provided
  if (normalized.options.select) {
    query = query.select(normalized.options.select);
  }

  // Apply sort if provided
  if (normalized.options.sort) {
    query = query.sort(normalized.options.sort);
  }

  // Apply limit if provided
  if (normalized.options.limit) {
    query = query.limit(normalized.options.limit);
  }

  // Apply skip if provided
  if (normalized.options.skip) {
    query = query.skip(normalized.options.skip);
  }

  const rows = await query.lean();
  return rows || [];
};

/**
 * findAndCountAll supports both (model, where, options) and (model, options) signatures.
 *
 * Returns { count, rows } where rows is array of plain objects.
 */
const findAndCountAll = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);
  
  // Count total matching documents
  const normalizedWhere = normalizeObjectIds(normalized.where);
  const count = await model.countDocuments(normalizedWhere);
  
  // Build the find query
  let query = model.find(normalizedWhere);

  // Apply populate if provided
  if (normalized.options.populate) {
    if (Array.isArray(normalized.options.populate)) {
      normalized.options.populate.forEach(pop => {
        query = query.populate(pop);
      });
    } else {
      query = query.populate(normalized.options.populate);
    }
  }

  // Apply select if provided
  if (normalized.options.select) {
    query = query.select(normalized.options.select);
  }

  // Apply sort if provided
  if (normalized.options.sort) {
    query = query.sort(normalized.options.sort);
  }

  // Apply limit if provided
  if (normalized.options.limit) {
    query = query.limit(normalized.options.limit);
  }

  // Apply skip if provided
  if (normalized.options.skip) {
    query = query.skip(normalized.options.skip);
  }

  const rows = await query.lean();

  return {
    count,
    rows: rows || []
  };
};

/**
 * count supports (model, where, options) and (model, options).
 * Returns a number.
 */
const count = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);
  return await model.countDocuments(normalizeObjectIds(normalized.where));
};

/**
 * remove (deleteMany) supports (model, where, options) and (model, options).
 * Returns number of deleted documents.
 */
const remove = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);
  const result = await model.deleteMany(normalizeObjectIds(normalized.where));
  return result.deletedCount || 0;
};

/**
 * updateAndReturn supports:
 *  - (model, where, values, options)
 *  - (model, options) where options may include { where, values, ... }
 *
 * Returns a consistent shape: { affectedCount, rows }.
 * - affectedCount: number of affected documents
 * - rows: array of plain JS objects (updated documents)
 */
const updateAndReturn = async (model, where = {}, values = {}, options = {}) => {
  // If caller passed (model, options) with values inside
  if (
    where &&
    typeof where === 'object' &&
    (where.populate ||
      where.select ||
      where.limit ||
      where.sort ||
      where.where ||
      where.values) &&
    (values == null || (typeof values === 'object' && Object.keys(values).length === 0))
  ) {
    options = { ...where };
    where = options.where || {};
    values = options.values || {};
  }

  const { _id, id, ...updateValues } = values || {};
  const result = await model.updateMany(
    normalizeObjectIds(where || {}),
    { $set: updateValues },
    { new: true }
  );

  const affectedCount = result.modifiedCount || 0;

  // Fetch the updated documents to return them
  let rows = [];
  if (affectedCount > 0) {
    rows = await findAll(model, normalizeObjectIds(where || {}));
  }

  return { affectedCount, rows };
};

module.exports = {
  createAndReturn,
  findOne,
  findAll,
  findAndCountAll,
  count,
  remove,
  updateAndReturn,
  mongoose
};
