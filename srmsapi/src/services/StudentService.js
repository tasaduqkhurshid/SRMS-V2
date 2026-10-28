"use strict";

const fs = require("fs").promises;
const { randomInt } = require("crypto");

const ModelUtils = require("../utils/ModelUtils");
const logger = require("../utils/logger");
const PwpConstants = require("../constants/PwpConstants");
const ImageService = require("./ImageService");
const storage = require("./storage/storage.service");
const { Student, School, Image, Subject, StudentSubject, AcademicYear, Course, CourseSubject } = require("../db/models");
const { ValidationError, NotFoundError, DatabaseError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const { getKeysFromArray } = require("../helpers/helper");

const getSchoolInitials = (schoolName = "") => {
  const initials = String(schoolName)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join("");

  return initials || "S";
};

const isStudentCodeConflict = (error) =>
  error?.code === 11000 && (
    Boolean(error.keyPattern?.student_code) ||
    String(error.message || "").includes("unique_student_code")
  );

const createStudent = async (payload) => {
  try {
    if (!payload) return success(null);

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
        logger.warn("Failed to auto-assign academic year:", err.message);
      }
    }

    if (!payload.school_id) throw new ValidationError("school_id is required to assign a student ID");

    const [school, academicYear] = await Promise.all([
      ModelUtils.findOne(School, { _id: payload.school_id }),
      payload.academic_year_id
        ? ModelUtils.findOne(AcademicYear, { _id: payload.academic_year_id, school_id: payload.school_id })
        : Promise.resolve(null)
    ]);
    if (!school) throw new NotFoundError("School");

    const yearFromName = String(academicYear?.name || "").match(/\b\d{4}\b/)?.[0];
    const admissionYear = academicYear?.start_date
      ? String(new Date(academicYear.start_date).getFullYear())
      : yearFromName || String(new Date().getFullYear());
    const initials = getSchoolInitials(school.school_name || school.name);
    let suffix = randomInt(1000, 10000);

    for (let attempt = 0; attempt < 10000; attempt += 1, suffix += 1) {
      const studentCode = `${initials}-${admissionYear}-${String(suffix).padStart(4, "0")}`;
      if (await Student.collection.findOne({ student_code: studentCode }, { projection: { _id: 1 } })) continue;

      try {
        const created = await ModelUtils.createAndReturn(Student, {
          ...payload,
          student_code: studentCode
        });
        return success(created || null);
      } catch (error) {
        if (!isStudentCodeConflict(error)) throw error;
      }
    }

    throw new DatabaseError("Could not reserve a unique student ID");
  } catch (error) {
    return failure(error);
  }
};

const updateStudent = async (id, payload) => {
  try {
    if (!id) return success(null);

    const whereCondition = { _id: id };
    const result = await ModelUtils.updateAndReturn(Student, whereCondition, payload);

    if (result && result.rows && result.rows.length) {
      return success(result.rows[0]);
    }

    const fresh = await ModelUtils.findOne(Student, { _id: id });
    return success(fresh || null);
  } catch (error) {
    return failure(error);
  }
};

const courseProgressionRank = (course) => {
  const text = `${course?.course_name || ""} ${course?.course_code || ""}`.toLowerCase().replace(/[._-]+/g, " ");
  if (/pre\s*nursery/.test(text)) return 0;
  if (/\bnursery\b/.test(text)) return 1;
  if (/\b(?:l\s*k\s*g|lower kindergarten)\b/.test(text)) return 2;
  if (/\b(?:u\s*k\s*g|upper kindergarten)\b/.test(text)) return 3;
  const grade = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  return grade ? 3 + Number(grade[1]) : null;
};

const promoteStudents = async ({ studentIds = [], targetCourseId, academicYearId = null, schoolId } = {}) => {
  try {
    const ids = [...new Set((Array.isArray(studentIds) ? studentIds : []).map(String).filter(Boolean))];
    if (!ids.length) throw new ValidationError("Select at least one student");
    if (!targetCourseId) throw new ValidationError("Select a target course");
    if (!schoolId) throw new ValidationError("School context is required");

    const promoteToNext = targetCourseId === "__NEXT__";
    const targetCourse = promoteToNext ? null : await ModelUtils.findOne(Course, { _id: targetCourseId, school_id: schoolId });
    if (!promoteToNext && !targetCourse) throw new NotFoundError("Target course");
    const schoolCourses = promoteToNext ? await ModelUtils.findAll(Course, { school_id: schoolId }) : [];
    if (academicYearId) {
      const academicYear = await ModelUtils.findOne(AcademicYear, { _id: academicYearId, school_id: schoolId });
      if (!academicYear) throw new NotFoundError("Academic year");
    }

    const students = await ModelUtils.findAll(Student, { _id: { $in: ids }, school_id: schoolId });
    if (students.length !== ids.length) throw new ValidationError("One or more selected students do not belong to this school");

    const promoted = [];
    const failed = [];

    for (const student of students) {
      const studentId = String(student._id);
      try {
        const oldCourseId = await getStudentCourseId(student);
        let studentTargetCourse = targetCourse;
        if (promoteToNext) {
          const currentCourse = schoolCourses.find(course => String(course._id) === String(oldCourseId));
          const currentRank = courseProgressionRank(currentCourse);
          if (currentRank === null) throw new ValidationError(`Could not determine the next course for ${student.name}; choose a destination course manually`);
          const nextRank = Math.min(...schoolCourses.map(courseProgressionRank).filter(rank => rank !== null && rank > currentRank));
          const nextCourses = schoolCourses.filter(course => courseProgressionRank(course) === nextRank);
          if (!Number.isFinite(nextRank) || nextCourses.length !== 1) throw new ValidationError(`Could not determine one next course for ${student.name}; choose a destination course manually`);
          studentTargetCourse = nextCourses[0];
        }
        const targetCourseSubjects = await ModelUtils.findAll(CourseSubject, { course_id: studentTargetCourse._id });
        const targetSubjectIds = (targetCourseSubjects || []).map(row => String(row.subject_id)).filter(Boolean);
        const oldCourseSubjects = oldCourseId
          ? await ModelUtils.findAll(CourseSubject, { course_id: oldCourseId })
          : [];
        const oldSubjectIds = (oldCourseSubjects || [])
          .map(row => String(row.subject_id))
          .filter(id => id && !targetSubjectIds.includes(id));

        if (oldSubjectIds.length) {
          await ModelUtils.remove(StudentSubject, {
            student_id: studentId,
            subject_id: { $in: oldSubjectIds },
          });
        }

        const updated = await updateStudent(studentId, {
          class: String(studentTargetCourse._id),
          ...(academicYearId ? { academic_year_id: academicYearId } : {}),
        });
        if (updated.error || !updated.data) throw updated.error || new NotFoundError("Student");

        const assigned = await assignCourseToStudent(studentId, String(studentTargetCourse._id), schoolId);
        if (assigned.error) logger.warn("Could not materialize all target course subjects during promotion:", assigned.error.message);
        promoted.push({ student_id: studentId, name: student.name, target_course: studentTargetCourse.course_name });
      } catch (error) {
        failed.push({ student_id: studentId, name: student.name, message: error.message || "Promotion failed" });
      }
    }

    return success({ promoted, failed, target_course: promoteToNext ? "next course" : targetCourse.course_name });
  } catch (error) {
    return failure(error);
  }
};

const getStudentDetails = async (id, schoolId = null) => {
  try {
    if (!id) return success(null);

    const student = await Student.findOne({ _id: id, ...(schoolId ? { school_id: schoolId } : {}) }).lean();
    if (!student) return success(null);

    const courseId = String(student.class || "");
    if (/^[a-f\d]{24}$/i.test(courseId)) {
      const course = await Course.findOne({ _id: courseId, ...(student.school_id ? { school_id: student.school_id } : {}) }).select("course_name").lean();
      if (course?.course_name) student.class = course.course_name;
    }

    let imageData = null;
    const storedImage = await readStudentImage(student);
    if (storedImage) {
      imageData = {
        url: `data:${storedImage.mimeType};base64,${storedImage.buffer.toString("base64")}`,
        file_name: storedImage.fileName || null,
        mime_type: storedImage.mimeType,
        created_at: storedImage.updatedAt || null,
      };
    }

    return success({
      studentData: student,
      imageData,
    });
  } catch (error) {
    return failure(error);
  }
};

const listStudents = async ({ page = 1, limit = 20, query = "", reqParams = {} } = {}) => {
  try {
    const pg = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Number(limit || 20));
    const skip = (pg - 1) * lim;

    const filter = {};

    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), "i");
      filter.$or = [
        { name: { $regex: searchRegex } },
        { roll_number: { $regex: searchRegex } },
        { student_code: { $regex: searchRegex } }
      ];
    }

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

    const students = result.rows || [];
    const courseIds = [...new Set(students.map((student) => String(student.class || "")).filter((id) => /^[a-f\d]{24}$/i.test(id)))];
    const [courses, legacyImageStudentIds] = await Promise.all([
      courseIds.length ? Course.find({ _id: { $in: courseIds } }).select("course_name").lean() : [],
      students.length ? Image.distinct("entity_id", { entity: "STUDENT", entity_type: "PROFILE", entity_id: { $in: students.map((student) => student._id) } }) : [],
    ]);
    const courseNames = new Map(courses.map((course) => [String(course._id), course.course_name]));
    const legacyImageIds = new Set(legacyImageStudentIds.map(String));
    const formattedStudents = students.map((student) => ({
      ...student,
      class: courseNames.get(String(student.class || "")) || student.class,
      has_profile_image: Boolean(student.profile_image_key) || legacyImageIds.has(String(student._id)),
    }));

    return success({
      meta: {
        page: pg,
        limit: lim,
        total: result.count,
        pages: Math.ceil(result.count / lim),
      },
      students: formattedStudents,
    });
  } catch (error) {
    return failure(error);
  }
};

const deleteStudent = async (id) => {
  try {
    if (!id) return success(false);

    await ModelUtils.remove(Image, {
      entity: "STUDENT",
      entity_id: id,
      entity_type: "PROFILE"
    });

    await ModelUtils.remove(Student, { _id: id });

    return success(true);
  } catch (error) {
    return failure(error);
  }
};

const getStudentCourseId = async (student) => {
  const classValue = String(student?.class || "");
  if (/^[a-f\d]{24}$/i.test(classValue)) return classValue;
  if (!classValue || !student?.school_id) return null;
  const course = await ModelUtils.findOne(Course, { course_name: classValue, school_id: student.school_id });
  return course?._id ? String(course._id) : null;
};

const getStudentSubjects = async (studentId) => {
  try {
    if (!studentId) throw new ValidationError("studentId is required");
    const [student, studentSubjects] = await Promise.all([
      ModelUtils.findOne(Student, { _id: studentId }),
      ModelUtils.findAll(StudentSubject, {
      student_id: studentId
    }, {
      populate: {
        path: "subject_id",
        select: "subject_name subject_code"
      },
      sort: { "subject_id._id": 1, "subject_id.subject_name": 1 }
      })
    ]);

    // Class subjects are defaults for every student in that class. Include them
    // at read time as well as explicit student assignments so older records
    // and newly assigned class subjects appear consistently in the profile.
    let courseSubjects = [];
    const courseId = await getStudentCourseId(student);
    if (courseId) {
      const CourseService = require("./CourseService");
      const result = await CourseService.getCourseSubjects(courseId);
      if (result.error) return failure(result.error);
      courseSubjects = (result.data || []).map(row => ({ ...row, assignment_source: "course" }));
    }

    const merged = new Map();
    for (const row of [...courseSubjects, ...(studentSubjects || []).map(item => ({ ...item, assignment_source: "student" }))]) {
      const subjectId = String(row?.subject_id?._id || row?.subject?._id || row?.subject_id || "");
      if (subjectId && !merged.has(subjectId)) merged.set(subjectId, row);
    }

    return success([...merged.values()]);
  } catch (error) {
    return failure(error);
  }
};

const setStudentSubjects = async (studentId, subjectIds = [], schoolId = null) => {
  try {
    if (!studentId) throw new ValidationError("studentId is required");

    const subIds = getKeysFromArray(subjectIds, "id");
    logger.debug("Setting subjects for student", studentId, "to", subIds);

    const savedSubjects = [];
    for (const subjectId of subIds) {
      const existing = await ModelUtils.findOne(StudentSubject, {
        student_id: studentId,
        subject_id: subjectId
      });

      if (!existing) {
        logger.debug("Assigning subject", subjectId, "to student", studentId);
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
    return success(savedSubjects);
  } catch (error) {
    return failure(error);
  }
};

const replaceStudentSubjects = async (studentId, subjectIds = [], schoolId = null) => {
  try {
    if (!studentId) throw new ValidationError("studentId is required");
    const student = await ModelUtils.findOne(Student, { _id: studentId });
    if (!student) throw new NotFoundError("Student");

    const requestedIds = getKeysFromArray(subjectIds, "id");
    const classSubjectIds = [];
    const courseId = await getStudentCourseId(student);
    if (courseId) {
      const CourseService = require("./CourseService");
      const courseResult = await CourseService.getCourseSubjects(courseId);
      if (courseResult.error) return failure(courseResult.error);
      for (const row of courseResult.data || []) {
        const id = row?.subject_id?._id || row?.subject?._id || row?.subject_id;
        if (id) classSubjectIds.push(String(id));
      }
    }

    // Class subjects remain assigned by default; the submitted list controls
    // student-specific additions and removals.
    const effectiveIds = [...new Set([...classSubjectIds, ...requestedIds])];
    await ModelUtils.remove(StudentSubject, {
      student_id: studentId,
      ...(effectiveIds.length ? { subject_id: { $nin: effectiveIds } } : {}),
    });
    const added = await setStudentSubjects(studentId, effectiveIds, schoolId || student.school_id);
    if (added.error) return added;
    return getStudentSubjects(studentId);
  } catch (error) {
    return failure(error);
  }
};

const assignCourseToStudent = async (studentId, courseId, schoolId = null) => {
  try {
    if (!studentId) throw new ValidationError("studentId is required");
    if (!courseId) throw new ValidationError("courseId is required");

    const CourseService = require("../services/CourseService");

    const courseSubjectsResult = await CourseService.getCourseSubjects(courseId);
    if (courseSubjectsResult.error) return failure(courseSubjectsResult.error);

    const courseSubjects = courseSubjectsResult.data;
    const subjectIds = (courseSubjects || []).map((r) => {
      if (r && r.subject && (r.subject._id || r.subject.id)) return String(r.subject._id || r.subject.id);
      if (r && (r.subject_id?._id || r.subject_id)) return String(r.subject_id._id || r.subject_id);
      if (r && (r._id || r.id)) return String(r._id || r.id);
      return null;
    }).filter(Boolean);

    const result = await setStudentSubjects(studentId, subjectIds, schoolId);
    return result;
  } catch (error) {
    return failure(error);
  }
};

const readStudentImage = async (student) => {
  if (student?.profile_image_key) {
    const object = await storage.getFile(student.profile_image_key, "private");
    return {
      buffer: object.body,
      mimeType: student.profile_image_mime_type || object.contentType || "image/jpeg",
      fileName: student.profile_image_name,
      updatedAt: student.profile_image_updated_at || student.updatedAt,
    };
  }

  // Retain read access to photos uploaded before private bucket storage was introduced.
  const legacy = await Image.findOne({ entity: "STUDENT", entity_id: student._id, entity_type: "PROFILE" }).lean();
  if (!legacy?.image_data) return null;
  const buffer = Buffer.isBuffer(legacy.image_data) ? legacy.image_data : Buffer.from(legacy.image_data?.data || legacy.image_data);
  return { buffer, mimeType: legacy.mime_type || "image/jpeg", fileName: legacy.file_name, updatedAt: legacy.updatedAt || legacy.created_at };
};

const getStudentImage = async (studentId, schoolId) => {
  try {
    const student = await Student.findOne({ _id: studentId, school_id: schoolId })
      .select("profile_image_key profile_image_mime_type profile_image_name profile_image_updated_at updatedAt").lean();
    if (!student) throw new NotFoundError("Student");
    return success(await readStudentImage({ ...student, _id: studentId }));
  } catch (error) {
    return failure(error);
  }
};

const saveStudentImage = async (studentId, file, schoolId) => {
  try {
    if (!studentId) throw new ValidationError("studentId is required");
    if (!file) throw new ValidationError("file is required");
    if (!schoolId) throw new ValidationError("School context is required to upload a student image");

    const student = await Student.findOne({ _id: studentId, school_id: schoolId });
    if (!student) throw new NotFoundError("Student");
    const school = await School.findById(schoolId).select("slug").lean();
    if (!school?.slug) throw new ValidationError("School storage location is unavailable");
    const uploaded = await ImageService.uploadImage("STUDENT", file, {
      schoolSlug: school.slug,
      category: "students",
      filenamePrefix: `${student._id}-profile`,
      bucketType: "private",
    });
    if (uploaded.error) throw uploaded.error;
    const { key, mimeType, fileName } = uploaded.data;
    const previousKey = student.profile_image_key;
    const updatedAt = new Date();
    try {
      student.profile_image_key = key;
      student.profile_image_mime_type = mimeType;
      student.profile_image_name = fileName;
      student.profile_image_updated_at = updatedAt;
      await student.save();
    } catch (error) {
      await storage.deleteFile(key, "private").catch(() => {});
      throw error;
    }
    await Image.deleteMany({ entity: "STUDENT", entity_id: studentId, entity_type: "PROFILE" }).catch(() => {});
    if (previousKey && previousKey !== key) await storage.deleteFile(previousKey, "private").catch(() => {});
    return success({ imageUrl: `/students/${studentId}/image?v=${updatedAt.getTime()}`, file_name: student.profile_image_name, mime_type: student.profile_image_mime_type, updated_at: updatedAt });
  } catch (error) {
    return failure(error);
  }
};

const bulkImportStudents = async (students, courseId, schoolId) => {
  try {
    const result = {
      success: 0,
      failed: 0,
      errors: []
    };

    if (!Array.isArray(students) || students.length === 0) {
      result.errors.push("No students provided for import");
      return success(result);
    }

    for (let idx = 0; idx < students.length; idx++) {
      try {
        const student = students[idx];

        if (!student.name || !student.roll_number) {
          result.failed++;
          result.errors.push(`Row ${idx + 1}: Missing name or roll_number`);
          continue;
        }

        const existing = await ModelUtils.findOne(Student, { roll_number: student.roll_number });

        if (existing) {
          result.failed++;
          result.errors.push(`Row ${idx + 1}: Roll number ${student.roll_number} already exists`);
          continue;
        }

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
        };

        const createdResult = await createStudent(payload);

        if (createdResult.error) {
          result.failed++;
          result.errors.push(`Row ${idx + 1}: ${createdResult.error.message}`);
          continue;
        }

        const created = createdResult.data;

        if (created) {
          if (courseId) {
            const assignResult = await assignCourseToStudent(created._id || created.id, courseId);
            if (assignResult.error) {
              logger.warn("Course assignment failed during bulk import:", assignResult.error.message);
            }
          }
          result.success++;
        } else {
          result.failed++;
          result.errors.push(`Row ${idx + 1}: Failed to create student`);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${idx + 1}: ${error.message}`);
        logger.error("Error importing student:", error);
      }
    }

    return success(result);
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  createStudent,
  updateStudent,
  promoteStudents,
  getStudentDetails,
  getStudentImage,
  getStudentSubjects,
  setStudentSubjects,
  replaceStudentSubjects,
  assignCourseToStudent,
  listStudents,
  deleteStudent,
  saveStudentImage,
  bulkImportStudents,
};
