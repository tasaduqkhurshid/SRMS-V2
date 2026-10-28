"use strict";

const ModelUtils = require("../utils/ModelUtils");
const RedisCacheService = require("./RedisCacheService");
const logger = require("../utils/logger");
const { Subject } = require("../db/models");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const CACHE_KEYS = {
  SUBJECTS_LIST: "subjects:list",
  SUBJECT: (id) => `subject:${id}`,
};

const createSubject = async (payload) => {
  try {
    if (!payload) return success(null);
    const created = await ModelUtils.createAndReturn(Subject, payload);

    if (created) {
      await RedisCacheService.del(CACHE_KEYS.SUBJECTS_LIST);
    }

    return success(created || null);
  } catch (error) {
    return failure(error);
  }
};

const updateSubject = async (id, payload) => {
  try {
    if (!id) return success(null);

    const where = { _id: id };
    const updatedRows = await ModelUtils.updateAndReturn(Subject, where, payload);

    if (updatedRows?.rows?.length) {
      await RedisCacheService.del(CACHE_KEYS.SUBJECT(id));
      await RedisCacheService.del(CACHE_KEYS.SUBJECTS_LIST);
      return success(updatedRows[0]);
    }

    const fresh = await ModelUtils.findOne(Subject, { _id: id });
    return success(fresh || null);
  } catch (error) {
    return failure(error);
  }
};

const getSubjectById = async (id) => {
  try {
    if (!id) return success(null);
    const subject = await RedisCacheService.getOrSet(
      CACHE_KEYS.SUBJECT(id),
      async () => await ModelUtils.findOne(Subject, { _id: id }),
      3600
    );
    return success(subject);
  } catch (error) {
    return failure(error);
  }
};

const getAllSubjects = async () => {
  try {
    logger.debug("SubjectService.getAllSubjects: Fetching all subjects");
    const subjects = await RedisCacheService.getOrSet(
      CACHE_KEYS.SUBJECTS_LIST,
      async () => {
        logger.debug("SubjectService.getAllSubjects: Cache miss, querying database");
        const subjectsData = await ModelUtils.findAll(Subject, {}, { sort: { subject_name: 1 } });
        logger.info(`SubjectService.getAllSubjects: Found ${subjectsData ? subjectsData.length : 0} subjects`);
        return subjectsData || [];
      },
      3600
    );
    return success(subjects);
  } catch (error) {
    logger.error("SubjectService.getAllSubjects error:", error);
    return failure(error);
  }
};

const listSubjects = async ({ page = 1, limit = 20, query = "" } = {}) => {
  try {
    const pg = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Number(limit || 20));
    const skip = (pg - 1) * lim;

    const where = {};
    if (query && String(query).trim()) {
      const regex = new RegExp(String(query).trim(), "i");
      where.$or = [
        { subject_name: regex },
        { subject_code: regex },
      ];
    }

    const result = await ModelUtils.findAndCountAll(Subject, where, { limit: lim, skip, sort: { _id: -1 } });

    return success({
      meta: {
        page: pg,
        limit: lim,
        total: result.count,
        pages: Math.ceil(result.count / lim),
      },
      subjects: result.rows,
    });
  } catch (error) {
    return failure(error);
  }
};

const deleteSubject = async (id) => {
  try {
    if (!id) return success(false);
    await ModelUtils.remove(Subject, { _id: id });

    await RedisCacheService.del(CACHE_KEYS.SUBJECT(id));
    await RedisCacheService.del(CACHE_KEYS.SUBJECTS_LIST);

    return success(true);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  createSubject,
  updateSubject,
  getSubjectById,
  getAllSubjects,
  listSubjects,
  deleteSubject,
};