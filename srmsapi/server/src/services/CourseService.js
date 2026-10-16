"use strict";

const ModelUtils = require("../utils/ModelUtils");
const RedisCacheService = require("./RedisCacheService");
const logger = require("../utils/logger");
const { Course, Subject, CourseSubject, Student, StudentSubject } = require("../db/models");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const CACHE_KEYS = {
  COURSES_LIST: "courses:list",
  COURSE: (id) => `course:${id}`,
  COURSE_SUBJECTS: (id) => `course:${id}:subjects:v2`,
};

const listCourses = async ({ page = 1, limit = 50, query = "" } = {}) => {
  try {
    const pg = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Number(limit || 50));
    const skip = (pg - 1) * lim;

    const where = {};
    if (query && query.trim()) {
      const regex = new RegExp(query.trim(), "i");
      where.$or = [
        { course_name: regex },
        { course_code: regex },
      ];
    }

    const result = await ModelUtils.findAndCountAll(Course, where, { limit: lim, skip, sort: { _id: -1 } });
    return success({ meta: { page: pg, limit: lim, total: result.count }, courses: result.rows });
  } catch (error) {
    return failure(error);
  }
};

const getAllCourses = async () => {
  try {
    logger.debug("CourseService.getAllCourses: Fetching all courses");
    const courses = await RedisCacheService.getOrSet(
      CACHE_KEYS.COURSES_LIST,
      async () => {
        logger.debug("CourseService.getAllCourses: Cache miss, querying database");
        const coursesData = await ModelUtils.findAll(Course, {}, { sort: { course_name: 1 } });
        logger.info(`CourseService.getAllCourses: Found ${coursesData ? coursesData.length : 0} courses`);
        return coursesData || [];
      },
      3600
    );
    return success(courses);
  } catch (error) {
    logger.error("CourseService.getAllCourses error:", error);
    return failure(error);
  }
};

const getCourseById = async (id) => {
  try {
    if (!id) return success(null);

    const course = await RedisCacheService.getOrSet(
      CACHE_KEYS.COURSE(id),
      async () => {
        return await ModelUtils.findOne(Course, { _id: id });
      },
      3600
    );
    return success(course);
  } catch (error) {
    return failure(error);
  }
};

const createCourse = async (payload) => {
  try {
    if (!payload) return success(null);
    const created = await ModelUtils.createAndReturn(Course, payload);

    if (created) {
      await RedisCacheService.del(CACHE_KEYS.COURSES_LIST);
    }

    return success(created);
  } catch (error) {
    return failure(error);
  }
};

const updateCourse = async (id, payload) => {
  try {
    if (!id) throw new ValidationError("courseId is required");
    const updated = await ModelUtils.updateAndReturn(Course, { _id: id }, payload);
    if (updated && updated.rows && updated.rows.length) {
      await RedisCacheService.del(CACHE_KEYS.COURSE(id));
      await RedisCacheService.del(CACHE_KEYS.COURSES_LIST);
      return success(updated.rows[0]);
    }
    throw new NotFoundError("Course");
  } catch (error) {
    return failure(error);
  }
};

const deleteCourse = async (id) => {
  try {
    if (!id) throw new ValidationError("courseId is required");
    await ModelUtils.remove(Course, { _id: id });

    await RedisCacheService.del(CACHE_KEYS.COURSE(id));
    await RedisCacheService.del(CACHE_KEYS.COURSES_LIST);

    return success(true);
  } catch (error) {
    return failure(error);
  }
};

const getCourseSubjects = async (courseId) => {
  try {
    if (!courseId) return success([]);

    const subjects = await RedisCacheService.getOrSet(
      CACHE_KEYS.COURSE_SUBJECTS(courseId),
      async () => {
        const rows = await ModelUtils.findAll(CourseSubject, { course_id: courseId }, {
          populate: { path: "subject_id", select: "subject_name subject_code has_theory has_lab has_attendance has_activity" },
          sort: { createdAt: 1 },
        });
        return (rows || []).map((row) => ({ ...row, subject: row.subject_id }));
      },
      3600
    );
    return success(subjects);
  } catch (error) {
    return failure(error);
  }
};

const setCourseSubjects = async (courseId, subjectIds = [], schoolId = null) => {
  try {
    if (!courseId) throw new ValidationError("courseId is required");
    const ids = Array.isArray(subjectIds) ? subjectIds.map((v) => String(v)).filter(Boolean) : [];

    const existingRows = await ModelUtils.findAll(CourseSubject, { course_id: courseId });
    const existingIds = (existingRows || []).map((r) => String(r.subject_id)).filter(Boolean);

    const toAdd = ids.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !ids.includes(id));

    const removeWhere = { course_id: courseId };
    if (ids.length) {
      removeWhere.subject_id = { $nin: ids };
    }
    await ModelUtils.remove(CourseSubject, removeWhere);

    const saved = [];
    for (const sid of ids) {
      const existing = await ModelUtils.findOne(CourseSubject, { course_id: courseId, subject_id: sid });
      if (!existing) {
        const created = await ModelUtils.createAndReturn(CourseSubject, { course_id: courseId, subject_id: sid, school_id: schoolId || null });
        saved.push(created);
      }
    }

    await RedisCacheService.del(CACHE_KEYS.COURSE_SUBJECTS(courseId));

    try {
      const students = await ModelUtils.findAll(Student, { class: courseId });
      const studentIds = (students || []).map((s) => s._id).filter(Boolean);

      if (toAdd.length && studentIds.length) {
        const StudentService = require("../services/StudentService");
        for (const sid of studentIds) {
          try {
            const assignResult = await StudentService.setStudentSubjects(sid, toAdd, schoolId || null);
            if (assignResult.error) {
              logger.warn("StudentService.setStudentSubjects failed during course subject update:", assignResult.error.message);
            }
          } catch (e) {
            // continue on errors for individual students
          }
        }
      }

      if (toRemove.length && studentIds.length) {
        await ModelUtils.remove(StudentSubject, {
          student_id: { $in: studentIds },
          subject_id: { $in: toRemove },
        });
      }
    } catch (propErr) {
      logger.error("CourseService.setCourseSubjects propagation error:", propErr);
    }

    const refreshedResult = await getCourseSubjects(courseId);
    return refreshedResult;
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  listCourses,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseSubjects,
  setCourseSubjects,
};
