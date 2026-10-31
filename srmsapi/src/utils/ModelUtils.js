"use strict";

/**
 * ModelUtils.js
 *
 * Generic model utilities for Mongoose models.
 *
 * Supported call signatures:
 *
 * 1. findOne(model, where, options)
 * 2. findOne(model, options)
 *
 * 3. findAll(model, where, options)
 * 4. findAll(model, options)
 *
 * Supports:
 * - Sequelize-style include
 * - Mongoose populate
 * - Nested include
 * - attributes / select
 * - Pagination
 * - Sorting
 * - ObjectId normalization
 *
 * Example:
 *
 * ModelUtils.findAll(Course, {
 *   where: { status: true },
 *   attributes: ["_id", "name"],
 *   include: [
 *     {
 *       model: CourseSubject,
 *       as: "subjects",
 *       attributes: ["_id", "subject_id"],
 *       include: [
 *         {
 *           model: Subject,
 *           as: "subject",
 *           attributes: ["_id", "name"]
 *         }
 *       ]
 *     }
 *   ]
 * });
 */

const mongoose = require("mongoose");

/* --------------------------------------------------
 * OBJECT ID NORMALIZATION
 * -------------------------------------------------- */

const normalizeObjectIds = (value, key = "", idContext = false) => {
  const isIdField = idContext || key === "_id" || key.endsWith("_id");

  if (Array.isArray(value)) {
    return value.map((item) => normalizeObjectIds(item, key, isIdField));
  }

  if (
    !value ||
    typeof value !== "object" ||
    value instanceof mongoose.Types.ObjectId
  ) {
    if (isIdField && mongoose.isValidObjectId(value)) {
      return new mongoose.Types.ObjectId(value);
    }

    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      normalizeObjectIds(entryValue, entryKey, isIdField),
    ]),
  );
};

/* --------------------------------------------------
 * HELPERS
 * -------------------------------------------------- */

/**
 * Detect whether the second argument is an options object.
 *
 * Supports:
 * - (model, where, options)
 * - (model, options)
 */
const normalizeWhereAndOptions = (maybeWhere = {}, maybeOptions = {}) => {
  const optionKeys = [
    "populate",
    "include",
    "attributes",
    "select",
    "limit",
    "sort",
    "skip",
    "where",
    "offset",
  ];

  const looksLikeOptions =
    maybeWhere &&
    typeof maybeWhere === "object" &&
    !Array.isArray(maybeWhere) &&
    optionKeys.some((key) =>
      Object.prototype.hasOwnProperty.call(maybeWhere, key),
    );

  if (looksLikeOptions) {
    const opts = { ...maybeWhere };

    return {
      where: opts.where || {},
      options: opts,
    };
  }

  return {
    where: maybeWhere || {},
    options: { ...(maybeOptions || {}) },
  };
};

/**
 * Convert attributes to Mongoose select.
 *
 * Sequelize:
 * attributes: ["_id", "name", "code"]
 *
 * Mongoose:
 * select: "_id name code"
 */
const normalizeAttributes = (attributes) => {
  if (!attributes) return undefined;

  if (Array.isArray(attributes)) {
    return attributes.join(" ");
  }

  if (typeof attributes === "string") {
    return attributes;
  }

  return undefined;
};

/**
 * Convert Sequelize-style include to Mongoose populate.
 *
 * Supported:
 * - model
 * - as
 * - path
 * - attributes
 * - where
 * - include
 * - options
 */
const normalizeInclude = (include) => {
  if (!include) return [];

  const includes = Array.isArray(include) ? include : [include];

  return includes
    .map((item) => {
      // Native populate path shorthand
      if (typeof item === "string") {
        return { path: item };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const path = item.as || item.path;

      if (!path) {
        return null;
      }

      const populate = {
        path,
      };

      // Mongoose model reference
      if (item.model) {
        populate.model = item.model;
      }

      // Field selection
      const select = normalizeAttributes(item.attributes);

      if (select) {
        populate.select = select;
      }

      // Relationship filtering
      if (item.where) {
        populate.match = normalizeObjectIds(item.where);
      }

      // Nested relationships
      if (item.include) {
        populate.populate = normalizeInclude(item.include);
      }

      // Native Mongoose populate options
      if (item.options) {
        populate.options = item.options;
      }

      if (item.match) {
        populate.match = normalizeObjectIds(item.match);
      }

      if (item.select) {
        populate.select = item.select;
      }

      return populate;
    })
    .filter(Boolean);
};

/**
 * Apply both native populate and Sequelize-style include.
 */
const applyPopulate = (query, options = {}) => {
  const populate = [
    ...(options.populate
      ? Array.isArray(options.populate)
        ? options.populate
        : [options.populate]
      : []),

    ...normalizeInclude(options.include),
  ];

  populate.forEach((item) => {
    query = query.populate(item);
  });

  return query;
};

/**
 * Apply root-level attributes/select.
 */
const applySelect = (query, options = {}) => {
  const select = normalizeAttributes(options.attributes) || options.select;

  if (select) {
    query = query.select(select);
  }

  return query;
};

/**
 * Apply common query options.
 */
const applyQueryOptions = (query, options = {}) => {
  query = applyPopulate(query, options);

  query = applySelect(query, options);

  if (options.sort) {
    query = query.sort(options.sort);
  }

  if (options.limit !== undefined && options.limit !== null) {
    query = query.limit(options.limit);
  }

  // Sequelize offset compatibility
  const skip = options.skip !== undefined ? options.skip : options.offset;

  if (skip !== undefined && skip !== null) {
    query = query.skip(skip);
  }

  return query;
};

/* --------------------------------------------------
 * CREATE
 * -------------------------------------------------- */

/**
 * Create a record and return a plain JS object.
 */
const createAndReturn = async (model, data) => {
  const created = await model.create(data);

  return created ? created.toObject() : null;
};

/* --------------------------------------------------
 * FIND ONE
 * -------------------------------------------------- */

/**
 * Find one document.
 *
 * Returns:
 * Object | null
 */
const findOne = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);

  const normalizedWhere = normalizeObjectIds(normalized.where);

  let query = model.findOne(normalizedWhere);

  query = applyQueryOptions(query, normalized.options);

  const result = await query.lean();

  return result || null;
};

/* --------------------------------------------------
 * FIND ALL
 * -------------------------------------------------- */

/**
 * Find multiple documents.
 *
 * Returns:
 * Array
 */
const findAll = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);

  const normalizedWhere = normalizeObjectIds(normalized.where);

  let query = model.find(normalizedWhere);

  query = applyQueryOptions(query, normalized.options);

  const rows = await query.lean();

  return rows || [];
};

/* --------------------------------------------------
 * FIND AND COUNT ALL
 * -------------------------------------------------- */

/**
 * Find documents and count total matching documents.
 *
 * Returns:
 * {
 *   count: Number,
 *   rows: Array
 * }
 *
 * Count is calculated without pagination.
 */
const findAndCountAll = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);

  const normalizedWhere = normalizeObjectIds(normalized.where);

  const count = await model.countDocuments(normalizedWhere);

  let query = model.find(normalizedWhere);

  query = applyQueryOptions(query, normalized.options);

  const rows = await query.lean();

  return {
    count,
    rows: rows || [],
  };
};

/* --------------------------------------------------
 * COUNT
 * -------------------------------------------------- */

/**
 * Count matching documents.
 *
 * Returns:
 * Number
 */
const count = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);

  return await model.countDocuments(normalizeObjectIds(normalized.where));
};

/* --------------------------------------------------
 * REMOVE
 * -------------------------------------------------- */

/**
 * Delete multiple documents.
 *
 * Returns:
 * Number of deleted documents.
 */
const remove = async (model, where = {}, options = {}) => {
  const normalized = normalizeWhereAndOptions(where, options);

  const result = await model.deleteMany(normalizeObjectIds(normalized.where));

  return result.deletedCount || 0;
};

/* --------------------------------------------------
 * UPDATE AND RETURN
 * -------------------------------------------------- */

/**
 * Update multiple documents and return updated rows.
 *
 * Supported:
 *
 * updateAndReturn(model, where, values, options)
 *
 * updateAndReturn(model, {
 *   where,
 *   values,
 *   include,
 *   attributes,
 *   sort
 * })
 *
 * Returns:
 * {
 *   affectedCount: Number,
 *   rows: Array
 * }
 */
const updateAndReturn = async (
  model,
  where = {},
  values = {},
  options = {},
) => {
  // Handle (model, options) signature
  const optionKeys = [
    "populate",
    "include",
    "attributes",
    "select",
    "limit",
    "sort",
    "where",
    "values",
  ];

  const looksLikeOptions =
    where &&
    typeof where === "object" &&
    !Array.isArray(where) &&
    optionKeys.some((key) =>
      Object.prototype.hasOwnProperty.call(where, key),
    ) &&
    (!values || Object.keys(values).length === 0);

  if (looksLikeOptions) {
    options = { ...where };

    where = options.where || {};

    values = options.values || {};
  }

  const { _id, id, ...updateValues } = values || {};

  const normalizedWhere = normalizeObjectIds(where || {});

  const result = await model.updateMany(normalizedWhere, {
    $set: updateValues,
  });

  const affectedCount = result.modifiedCount || 0;

  let rows = [];

  if (affectedCount > 0) {
    rows = await findAll(model, normalizedWhere, options);
  }

  return {
    affectedCount,
    rows,
  };
};

/* --------------------------------------------------
 * EXPORTS
 * -------------------------------------------------- */

module.exports = {
  createAndReturn,
  findOne,
  findAll,
  findAndCountAll,
  count,
  remove,
  updateAndReturn,

  // Expose helpers if needed
  normalizeObjectIds,
  normalizeInclude,
  applyPopulate,

  mongoose,
};
