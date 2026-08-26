"use strict";

const ModelUtils = require("../utils/ModelUtils");
const RedisCacheService = require("./RedisCacheService");
const logger  = require("../utils/logger");
const { Subject } = require("../db/models");

const CACHE_KEYS = {
  SUBJECTS_LIST: "subjects:list",
  SUBJECT: (id) => `subject:${id}`
};

/**
 * Subject service
 * - createSubject(payload)
 * - updateSubject(id, payload)
 * - getSubjectDetails(id)
 * - listSubjects({ page, limit, query })
 * - deleteSubject(id)
 */

const createSubject = async (payload) => {
  if (!payload) return null;
  const created = await ModelUtils.createAndReturn(Subject, payload);
  
  // Invalidate cache
  if (created) {
    await RedisCacheService.del(CACHE_KEYS.SUBJECTS_LIST);
  }
  
  return created || null;
};

const updateSubject = async (id, payload) => {
  if (!id) return null;

  const where = { _id: id };
  const updatedRows = await ModelUtils.updateAndReturn(Subject, where, payload);

  if (updatedRows?.rows?.length) {
    // Invalidate cache
    await RedisCacheService.del(CACHE_KEYS.SUBJECT(id));
    await RedisCacheService.del(CACHE_KEYS.SUBJECTS_LIST);
    return updatedRows[0];
  }

  const fresh = await ModelUtils.findOne(Subject, { _id: id });
  return fresh || null;
};

const getSubjectDetails = async (id) => {
  if (!id) return null;
  return await RedisCacheService.getOrSet(
    CACHE_KEYS.SUBJECT(id),
    async () => await ModelUtils.findOne(Subject, { _id: id }),
    3600
  );
};

/**
 * Get all subjects for select dropdowns (cached)
 */
const getAllSubjects = async () => {
  logger.debug('SubjectService.getAllSubjects: Fetching all subjects');
  try {
    return await RedisCacheService.getOrSet(
      CACHE_KEYS.SUBJECTS_LIST,
      async () => {
        logger.debug('SubjectService.getAllSubjects: Cache miss, querying database');
        const subjects = await ModelUtils.findAll(Subject, {}, { sort: { subject_name: 1 } });
        logger.info(`SubjectService.getAllSubjects: Found ${subjects ? subjects.length : 0} subjects`);
        return subjects || [];
      },
      3600 // Cache for 1 hour
    );
  } catch (error) {
    logger.error('SubjectService.getAllSubjects error:', error);
    throw error;
  }
};

const listSubjects = async ({ page = 1, limit = 20, query = "" } = {}) => {
  const pg = Math.max(1, Number(page || 1));
  const lim = Math.max(1, Number(limit || 20));
  const skip = (pg - 1) * lim;

  const where = {};
  if (query && String(query).trim()) {
    const regex = new RegExp(String(query).trim(), 'i');
    where.$or = [
      { subject_name: regex },
      { subject_code: regex },
    ];
  }

  const result = await ModelUtils.findAndCountAll(Subject, where, { limit: lim, skip, sort: { _id: -1 } });

  return {
    meta: {
      page: pg,
      limit: lim,
      total: result.count,
      pages: Math.ceil(result.count / lim),
    },
    subjects: result.rows,
  };
};

const deleteSubject = async (id) => {
  if (!id) return false;
  await ModelUtils.remove(Subject, { _id: id });
  
  // Invalidate cache
  await RedisCacheService.del(CACHE_KEYS.SUBJECT(id));
  await RedisCacheService.del(CACHE_KEYS.SUBJECTS_LIST);
  
  return true;
};

module.exports = {
  createSubject,
  updateSubject,
  getSubjectDetails,
  getAllSubjects,
  listSubjects,
  deleteSubject,
};
