"use strict";

const StudentService = require("../services/StudentService");
const { STATUS } = require("../constants/status");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const { Student } = require("../db/models");
const { normalizeImageToFile } = require("../services/ImageService");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const saveStudentDetails = asyncHandler(async (req, res, next) => {
  const requestParams = {
    ...(req.query || {}),
    ...(req.params || {}),
    ...(req.body || {}),
  };

  if (req.user) {
    const userSchoolId =
      req.user.school_id ||
      req.user.SchoolId ||
      req.user.schoolId ||
      null;
    if (userSchoolId) {
      requestParams.school_id = userSchoolId;
    }
  }

  logger.debug("saveStudentDetails requestParams:", requestParams);

  const studentId = requestParams.studentId || null;

  if (!studentId && (!requestParams.name || !requestParams.roll_number)) {
    throw new ValidationError("name and roll_number are required");
  }

  let studentResult;

  if (studentId) {
    const student_obj = {
      name: requestParams.name || null,
      roll_number: requestParams.roll_number || null,
      admission_number: requestParams.admission_number || null,
      class: requestParams.class || null,
      section: requestParams.section || null,
      gender: requestParams.gender || null,
      dob: requestParams.dob || null,
      father_name: requestParams.father_name || null,
      mother_name: requestParams.mother_name || null,
      address: requestParams.address || null,
      pincode: requestParams.pincode || null,
      school_id:
        req.user?.school_id ||
        req.user?.SchoolId ||
        req.user?.schoolId ||
        null,
      academic_year_id: requestParams.academic_year_id || null,
    };

    studentResult = await StudentService.updateStudent(studentId, student_obj);
    if (studentResult.error) return next(studentResult.error);

    if (!studentResult.data) {
      throw new NotFoundError("Student");
    }
  } else {
    studentResult = await StudentService.createStudent(requestParams);
    if (studentResult.error) return next(studentResult.error);

    if (!studentResult.data) {
      throw new NotFoundError("Student");
    }
  }

  const student = studentResult.data;

  let image = requestParams.image || null;

  if (!image && req.file) image = req.file;

  if (student && image) {
    try {
      const idToUse = studentId || student._id;
      logger.debug("saveStudentDetails: saving image for student ID =", idToUse);

      const fileObjResult = await normalizeImageToFile(image, {
        image_name: requestParams.image_name || requestParams.file_name,
      });
      if (fileObjResult.error) return next(fileObjResult.error);

      const savedImageResult = await StudentService.saveStudentImage(idToUse, fileObjResult.data);
      if (savedImageResult.error) return next(savedImageResult.error);

      if (savedImageResult.data) {
        student.image =
          savedImageResult.data.imageUrl ||
          savedImageResult.data.url ||
          savedImageResult.data.image ||
          student.image;
      }
    } catch (imgErr) {
      logger.error("saveStudentDetails: image save failed:", imgErr);

      return sendSuccessJsonResponse(res, {
        statusCode: STATUS.OK,
        message: "Student saved but image upload failed",
        data: student,
        imageError: imgErr.message || String(imgErr),
      });
    }
  }

  try {
    const classVal = requestParams.class || null;
    const classId = classVal ? String(classVal) : null;
    if (classId) {
      const schoolId = req.user
        ? req.user.school_id ||
          req.user.SchoolId ||
          req.user.schoolId ||
          null
        : null;
      const studentIdToUse = student?._id || studentId || null;
      if (studentIdToUse) {
        const assignResult = await StudentService.assignCourseToStudent(
          studentIdToUse,
          classId,
          schoolId
        );
        if (assignResult.error) {
          logger.error("saveStudentDetails: assignCourseToStudent failed:", assignResult.error);
        }
      }
    }
  } catch (assignErr) {
    logger.error("saveStudentDetails: assignCourseToStudent failed:", assignErr);
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Student saved successfully",
    data: student,
  });
});

const setStudentPassword = asyncHandler(async (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  const updated = await Student.findOneAndUpdate(
    { _id: req.params.id, school_id: req.schoolId },
    { $set: { password_hash: await bcrypt.hash(password, 12) } },
    { new: true }
  ).select("_id");

  if (!updated) {
    throw new NotFoundError("Student");
  }

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Student password updated" });
});

const updateStudent = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const payload = req.body || {};

  if (!id) {
    throw new ValidationError("student id is required");
  }

  const result = await StudentService.updateStudent(id, payload);
  if (result.error) return next(result.error);

  if (!result.data) {
    throw new NotFoundError("Student");
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Student updated successfully",
    data: result.data,
  });
});

const getStudentDetails = asyncHandler(async (req, res, next) => {
  logger.debug("getStudentDetails called with params:", req.params);
  const id = req.params.id;

  if (!id) {
    throw new ValidationError("student id is required");
  }

  const result = await StudentService.getStudentDetails(id);
  if (result.error) return next(result.error);

  if (!result.data || !result.data.studentData) {
    throw new NotFoundError("Student");
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Student details retrieved",
    data: result.data,
  });
});

const listStudents = asyncHandler(async (req, res, next) => {
  const reqParams = {
    ...req.query,
    ...req.body,
    ...req.params,
  };

  logger.debug("listStudents reqParams:", reqParams);

  const page = Number(reqParams.page || 1);
  const limit = Number(reqParams.limit || 20);
  const query = (reqParams.q || "").trim();

  const result = await StudentService.listStudents({
    page,
    limit,
    query,
    reqParams,
  });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Students retrieved",
    data: result.data,
  });
});

const listStudentsByClass = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 1000);

  const result = await StudentService.listStudents({
    page,
    limit,
    reqParams: { course_id: courseId },
  });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Students retrieved",
    data: result.data,
  });
});

const deleteStudent = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    throw new ValidationError("student id is required");
  }

  const result = await StudentService.deleteStudent(id);
  if (result.error) return next(result.error);

  if (!result.data) {
    throw new NotFoundError("Student");
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Student deleted",
  });
});

const listStudentSubjects = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    throw new ValidationError("student id is required");
  }

  const result = await StudentService.getStudentSubjects(id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Student subjects retrieved", data: result.data });
});

const setStudentSubjects = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const requestParams = { ...req.query, ...req.body, ...req.params };

  logger.debug("setStudentSubjects called for student ID =", id, "with params:", requestParams);

  if (!id) {
    throw new ValidationError("student id is required");
  }

  const subjectIds = requestParams.subjects || [];
  logger.debug("Subject IDs to set:", subjectIds);

  let schoolId = null;
  if (req.user)
    schoolId =
      req.user.school_id ||
      req.user.SchoolId ||
      req.user.schoolId ||
      null;

  const result = await StudentService.setStudentSubjects(
    id,
    subjectIds,
    schoolId
  );
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Student subjects updated", data: result.data });
});

const setStudentCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    throw new ValidationError("student id is required");
  }

  const payload = req.body || {};
  const courseId = payload.course_id || payload.courseId || null;

  if (!courseId) {
    throw new ValidationError("course_id is required");
  }

  let schoolId = null;
  if (req.user)
    schoolId =
      req.user.school_id ||
      req.user.SchoolId ||
      req.user.schoolId ||
      null;

  const result = await StudentService.assignCourseToStudent(
    id,
    courseId,
    schoolId
  );
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, { statusCode: STATUS.OK, message: "Course assigned to student", data: result.data });
});

const uploadStudentImage = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    throw new ValidationError("student id is required");
  }

  const file = req.file;

  if (!file) {
    throw new ValidationError("Image file is required (multipart/form-data)");
  }

  const result = await StudentService.saveStudentImage(id, file);
  if (result.error) return next(result.error);

  if (!result.data) {
    throw new ValidationError("Image upload failed");
  }

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: "Student image uploaded",
    data: result.data,
  });
});

const bulkImportStudents = asyncHandler(async (req, res, next) => {
  const courseId = req.body?.course_id || req.query?.course_id;
  const schoolId = req.user?.school_id || req.user?.SchoolId;

  if (!courseId) {
    throw new ValidationError("course_id is required");
  }

  if (!req.file) {
    throw new ValidationError("No file uploaded");
  }

  let students = [];
  const filename = req.file.originalname.toLowerCase();

  if (filename.endsWith(".csv")) {
    const csv = require("csv-parse/sync");
    const records = csv.parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    students = records;
  } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
    const xlsx = require("xlsx");
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    students = xlsx.utils.sheet_to_json(sheet);
  } else {
    throw new ValidationError("File must be CSV or XLSX");
  }

  const result = await StudentService.bulkImportStudents(
    students,
    courseId,
    schoolId
  );
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: STATUS.OK,
    message: result.data.failed > 0 ? "Import completed with some failures" : "Import completed successfully",
    data: result.data,
  });
});

module.exports = {
  saveStudentDetails,
  updateStudent,
  getStudentDetails,
  listStudents,
  listStudentsByClass,
  deleteStudent,
  listStudentSubjects,
  setStudentSubjects,
  uploadStudentImage,
  setStudentPassword,
  setStudentCourse,
  bulkImportStudents,
};