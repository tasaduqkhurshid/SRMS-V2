"use strict";

const path = require("path");
const fs = require("fs").promises; // kept in case you extend, not used for blob storage

const ModelUtils = require("../utils/ModelUtils");
const logger  = require("../utils/logger");
const PwpConstants = require("../constants/PwpConstants");
const ImageService = require("./ImageService");
const { Student, Image, Subject, StudentSubject, AcademicYear } = require("../db/models");

const { getKeysFromArray } = require("../helpers/helper");

/**
 * createStudent(payload)
 * updateStudent(id, payload)
 * getStudentDetails(id) -> { studentData, imageData }
 * listStudents({ page, limit, query })
 * deleteStudent(id)
 * saveStudentImage(studentId, file) // expects multer file with buffer
 */

/**
 * Create student and return plain object
 * Auto-assigns current/latest academic year if not provided
 */
const createStudent = async (payload) => {
  if (!payload) return null;
  
  // Auto-assign current academic year if not provided
  if (!payload.academic_year_id && payload.school_id) {
    try {
      const latestYear = await ModelUtils.findOne(AcademicYear, {
        school_id: payload.school_id
      }, {
        sort: { start_date: -1 }
      });
      if (latestYear) {
        payload.academic_year_id = latestYear._id;
      }
    } catch (err) {
      logger.warn('Failed to auto-assign academic year:', err.message);
    }
  }
  
  const created = await ModelUtils.createAndReturn(Student, payload);
  return created || null;
};

/**
 * Update student by id and return updated plain object
 */
const updateStudent = async (id, payload) => {
  if (!id) return null;

  // Try updateAndReturn
  const whereCondition = {
    _id: id
  }
  const result = await ModelUtils.updateAndReturn(Student, whereCondition, payload);

  // updateAndReturn returns { affectedCount, rows }
  if (result && result.rows && result.rows.length) {
    return result.rows[0];
  }

  // otherwise fetch fresh record
  const fresh = await ModelUtils.findOne(Student, { _id: id });
  return fresh || null;
};

/**
 * Get student details and associated image (as base64 data URL).
 * Returns: { studentData, imageData }
 * imageData shape: { url: "data:<mime>;base64,<data>", file_name, mime_type } or null
 */
const getStudentDetails = async (id) => {
  if (!id) return null;

  const student = await ModelUtils.findOne(Student, { _id: id });
  if (!student) return null;

  const imageRecord = await ModelUtils.findOne(Image, {
    entity: "STUDENT",
    entity_id: id,
    entity_type: "PROFILE"
  });

  let imageData = null;
  if (imageRecord && imageRecord.image_data) {
    // image_data should already be a Buffer in Mongoose
    let buffer = imageRecord.image_data;
    // ensure Buffer
    if (!Buffer.isBuffer(buffer) && buffer.data) {
      // sometimes it comes as { type: 'Buffer', data: [...] }
      buffer = Buffer.from(buffer.data);
    } else if (!Buffer.isBuffer(buffer)) {
      // fallback: try creating Buffer
      try {
        buffer = Buffer.from(buffer);
      } catch (e) {
        buffer = null;
      }
    }

    if (buffer) {
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${imageRecord.mime_type || "image/jpeg"};base64,${base64}`;
      imageData = {
        url: dataUrl,
        file_name: imageRecord.file_name || null,
        mime_type: imageRecord.mime_type || null,
        created_at: imageRecord.createdAt || imageRecord.created_at || null,
      };
    }
  }

  return {
    studentData: student,
    imageData,
  };
};

/**
 * List students with pagination and optional search (name/roll_number)
 * Uses ModelUtils.findAndCountAll
 */
const listStudents = async ({ page = 1, limit = 20, query = "", reqParams = {} } = {}) => {
  const pg = Math.max(1, Number(page || 1));
  const lim = Math.max(1, Number(limit || 20));
  const skip = (pg - 1) * lim;

  const filter = {};

  if (query && query.trim()) {
    const searchRegex = new RegExp(query.trim(), 'i'); // case-insensitive search
    filter.$or = [
      { name: { $regex: searchRegex } },
      { roll_number: { $regex: searchRegex } }
    ];
  }

  // Support filtering by course/class via query params: course_id, courseId, class
  try {
    const courseIdRaw = reqParams && (reqParams.course_id || reqParams.courseId || reqParams.class || reqParams.course);
    const courseId = courseIdRaw ? courseIdRaw.toString() : null;
    if (courseId) {
      filter.class = courseId;
    }
  } catch (e) {
    // ignore malformed course id
  }

  const result = await ModelUtils.findAndCountAll(Student, filter, {
    limit: lim,
    skip,
    sort: { _id: -1 }
  });

  return {
    meta: {
      page: pg,
      limit: lim,
      total: result.count,
      pages: Math.ceil(result.count / lim),
    },
    students: result.rows,
  };
};

/**
 * Delete student and associated image blob record
 */
const deleteStudent = async (id) => {
  if (!id) return false;

  // remove image record if exists
  await ModelUtils.remove(Image, {
    entity: "STUDENT",
    entity_id: id,
    entity_type: "PROFILE"
  });

  // remove student record
  await ModelUtils.remove(Student, { _id: id });

  return true;
};

/**
 * Get subjects assigned to a student
 * Returns array of Subject rows (joined)
 */
const getStudentSubjects = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId is required");
  }
  // direct query joining student_subjects -> subjects
  const studentSubjects = await ModelUtils.findAll(StudentSubject, {
    student_id: studentId
  }, {
    populate: {
      path: 'subject_id',
      select: 'subject_name subject_code'
    },
    sort: { 'subject_id._id': 1, 'subject_id.subject_name': 1 }
  });

  return studentSubjects || [];
};

/**
 * Replace student's subjects with the provided array of subject IDs
 */
const setStudentSubjects = async (studentId, subjectIds = [], schoolId = null) => {
  if (!studentId) throw new Error("studentId is required");

  // Normalize ids
  const subIds = getKeysFromArray(subjectIds, "id");
  console.log("Setting subjects for student", studentId, "to", subIds);

  const savedSubjects = [];
  // Upsert new assignments (insert if not exists)
  for (const subjectId of subIds) {
    const existing = await ModelUtils.findOne(StudentSubject, {
      student_id: studentId,
      subject_id: subjectId
    });

    if (!existing) {
      console.log("Assigning subject", subjectId, "to student", studentId);
      // attach academic_year_id from student if available
      const studentRec = await ModelUtils.findOne(Student, { _id: studentId });
      const academic_year_id = studentRec && studentRec.academic_year_id ? studentRec.academic_year_id : null;
      const created = await ModelUtils.createAndReturn(StudentSubject, {
        student_id: studentId,
        subject_id: subjectId,
        school_id: schoolId || (studentRec && studentRec.school_id) || null,
        academic_year_id,
      });
      savedSubjects.push(created);
    }
  }
  return savedSubjects;
};

/**
 * Assign a course to a student: fetch course subjects and assign them to the student.
 * Does not persist a course_id on student (unless you have such a column).
 */
const assignCourseToStudent = async (studentId, courseId, schoolId = null) => {
  if (!studentId) throw new Error("studentId is required");
  if (!courseId) throw new Error("courseId is required");

  // Lazy require to avoid circular requires at module load
  const CourseService = require("../services/CourseService");

  // Get course subjects
  const courseSubjects = await CourseService.getCourseSubjects(courseId);
  // courseSubjects may be array of { id, subject: { id, subject_name, ... } } or subject rows
  const subjectIds = (courseSubjects || []).map((r) => {
    if (r && r.subject_id) return Number(r.subject_id);
    if (r && r.subject && r.subject.id) return Number(r.subject.id);
    if (r && r.id) return Number(r.id);
    return null;
  }).filter(Boolean);

  // Delegate to existing helper which replaces student's subjects
  const result = await setStudentSubjects(studentId, subjectIds, schoolId);
  return result;
};

/**
 * Save/update student image (BLOB storage).
 * Expects `file` coming from multer middleware with `buffer`, `originalname`, `mimetype`.
 * Returns created/updated image plain object.
 * Validates file using PwpConstants.Image_ENTITIES.STUDENT configuration.
 */
const saveStudentImage = async (studentId, file) => {
  if (!studentId) throw new Error("studentId is required");
  if (!file) throw new Error("file is required");

  // Validate file against STUDENT image constraints
  const validation = ImageService.validateImageFile('STUDENT', file);
  if (!validation.isValid) {
    throw new Error(`Invalid student image: ${validation.error}`);
  }

  // Ensure student exists
  const student = await ModelUtils.findOne(Student, { _id: studentId });
  if (!student) throw new Error("Student not found");

  // Prepare payload
  const payload = {
    entity: "STUDENT",
    entity_id: studentId,
    entity_type: "PROFILE",
    image_data: file.buffer, // Buffer
    file_name: file.originalname || null,
    mime_type: file.mimetype || null,
  };

  // Check existing image for this student & profile type
  const existing = await ModelUtils.findOne(Image, {
    entity: "STUDENT",
    entity_id: studentId,
    entity_type: "PROFILE"
  });

  logger && logger.debug && logger.debug("saveStudentImage: existing image =", existing ? existing._id : null, existing ? "found" : "not found");

  if (existing) {
    // update and return updated row(s)
    const updated = await ModelUtils.updateAndReturn(Image, { _id: existing._id }, payload);
    return updated && updated.rows && updated.rows.length ? updated.rows[0] : updated;
  } else {
    const created = await ModelUtils.createAndReturn(Image, payload);
    return created;
  }
};

/**
 * Bulk import students from array
 * @param {Array} students - Array of student objects
 * @param {Number} courseId - Course/Class ID to assign to all students
 * @param {Number} schoolId - School ID
 * @returns {Object} { success: count, failed: count, errors: [] }
 */
const bulkImportStudents = async (students, courseId, schoolId) => {
  const result = {
    success: 0,
    failed: 0,
    errors: []
  }

  if (!Array.isArray(students) || students.length === 0) {
    result.errors.push('No students provided for import')
    return result
  }

  for (let idx = 0; idx < students.length; idx++) {
    try {
      const student = students[idx]

      // Validate required fields
      if (!student.name || !student.roll_number) {
        result.failed++
        result.errors.push(`Row ${idx + 1}: Missing name or roll_number`)
        continue
      }

      // Check for duplicate roll number
      const existing = await ModelUtils.findOne(Student, {
        roll_number: student.roll_number
      })

      if (existing) {
        result.failed++
        result.errors.push(`Row ${idx + 1}: Roll number ${student.roll_number} already exists`)
        continue
      }

      // Create student with all fields
      const payload = {
        name: student.name,
        roll_number: student.roll_number,
        father_name: student.father_name || null,
        mother_name: student.mother_name || null,
        address: student.address || null,
        pincode: student.pincode || null,
        class: courseId || student.class || null,
        section: student.section || null,
        gender: student.gender || null,
        dob: student.dob || null,
        admission_number: student.admission_number || null,
        school_id: schoolId
      }

      const created = await createStudent(payload)

      if (created) {
        // Assign to course if provided
        if (courseId) {
          await assignCourseToStudent(created._id || created.id, courseId)
        }
        result.success++
      } else {
        result.failed++
        result.errors.push(`Row ${idx + 1}: Failed to create student`)
      }
    } catch (error) {
      result.failed++
      result.errors.push(`Row ${idx + 1}: ${error.message}`)
      logger && logger.error && logger.error('Error importing student:', error)
    }
  }

  return result
};

module.exports = {
  createStudent,
  updateStudent,
  getStudentDetails,
  getStudentSubjects,
  setStudentSubjects,
  assignCourseToStudent,
  listStudents,
  deleteStudent,
  saveStudentImage,
  bulkImportStudents,
};
