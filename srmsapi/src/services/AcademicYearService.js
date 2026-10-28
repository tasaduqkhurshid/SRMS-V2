"use strict";

const ModelUtils = require("../utils/ModelUtils");
const { AcademicYear } = require("../db/models");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const listAcademicYears = async ({ page = 1, limit = 50, query = "" } = {}) => {
  try {
    const pg = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Number(limit || 50));
    const skip = (pg - 1) * lim;
    const where = {};
    if (query && query.trim()) {
      where.name = new RegExp(query.trim(), "i");
    }
    const result = await ModelUtils.findAndCountAll(AcademicYear, where, { limit: lim, skip, sort: { _id: -1 } });
    return success({
      meta: { page: pg, limit: lim, total: result.count },
      academic_years: result.rows,
    });
  } catch (error) {
    return failure(error);
  }
};

const getAcademicYearById = async (id) => {
  try {
    if (!id) return success(null);
    const academicYear = await ModelUtils.findOne(AcademicYear, { _id: id });
    return success(academicYear);
  } catch (error) {
    return failure(error);
  }
};

const createAcademicYear = async (payload) => {
  try {
    if (!payload) return success(null);
    const academicYear = await ModelUtils.createAndReturn(AcademicYear, payload);
    return success(academicYear);
  } catch (error) {
    return failure(error);
  }
};

const updateAcademicYear = async (id, payload) => {
  try {
    if (!id) return success(null);
    const updated = await ModelUtils.updateAndReturn(AcademicYear, { _id: id }, payload);
    if (updated && updated.rows && updated.rows.length) return success(updated.rows[0]);
    const fresh = await getAcademicYearById(id);
    return fresh;
  } catch (error) {
    return failure(error);
  }
};

const deleteAcademicYear = async (id) => {
  try {
    if (!id) return success(false);
    await ModelUtils.remove(AcademicYear, { _id: id });
    return success(true);
  } catch (error) {
    return failure(error);
  }
};

const getAllAcademicYears = async () => {
  try {
    const academicYears = await ModelUtils.findAll(AcademicYear, {}, { sort: { name: 1 } });
    return success(academicYears);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  listAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getAllAcademicYears,
};