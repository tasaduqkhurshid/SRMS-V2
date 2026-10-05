// controllers/student.controller.js
const  StudentService = require("../services/StudentService");
const { STATUS } = require("../constants/status");
const logger = require("../utils/logger")
const bcrypt = require("bcryptjs");
const { Student } = require("../db/models");
const { normalizeImageToFile } = require("../services/ImageService");

const saveStudentDetails = async (req, res) => {
  try {
    // Merged request params: (req.params > req.query > req.body)
    const requestParams = {
      ...(req.query || {}),
      ...(req.params || {}),
      ...(req.body || {})
    };

    if (req.user) {
      const userSchoolId = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;
      if (userSchoolId) {
        // ensure we send the underscored key expected by the Student model
        requestParams.school_id = userSchoolId;
      }
    }

    // Log requestParams for debugging (per project policy: only log request params)
    logger && logger.debug && logger.debug("saveStudentDetails requestParams:", requestParams);
    const studentId = requestParams.studentId || null;

    // Basic validation only for CREATE
    if (!studentId && (!requestParams.name || !requestParams.roll_number)) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "name and roll_number are required",
      });
    }

    let student;

    // ------------------- UPDATE -------------------
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
        school_id: req.user?.school_id || req.user?.SchoolId || req.user?.schoolId || null,
        academic_year_id: requestParams.academic_year_id || null
      }
      student = await StudentService.updateStudent(studentId, student_obj);

      if (!student) {
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
          status: "error",
          message: "Failed to update student",
        });
      }
    }

    // ------------------- CREATE -------------------
    else {
      student = await StudentService.createStudent(requestParams);

      if (!student) {
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
          status: "error",
          message: "Failed to create student",
        });
      }
    }

    // ------------------- SAVE IMAGE (optional) -------------------
    // The endpoint accepts image either as a multer-style file (when multipart
    // is used) or as a base64/dataURL string in the request body under `image`.
    let image = requestParams.image || null;

    // If a multipart upload (middleware) put file on req.file, prefer that
    if (!image && req.file) image = req.file;

    if (student && image) {
      try {
        const idToUse = studentId || student._id;
  logger && logger.debug && logger.debug("saveStudentDetails: saving image for student ID =", idToUse);

        // Use ImageService to normalize image into { buffer, originalname, mimetype }
        const fileObj = await normalizeImageToFile(image, {
          image_name: requestParams.image_name || requestParams.file_name,
        });

        const savedImage = await StudentService.saveStudentImage(idToUse, fileObj);

        if (savedImage) {
          student.image =
            savedImage.imageUrl ||
            savedImage.url ||
            savedImage.image ||
            student.image;
        }
      } catch (imgErr) {
        logger && logger.error && logger.error("saveStudentDetails: image save failed:", imgErr);

        // Student saved → return partial success
        return res.status(STATUS.OK).json({
          status: "partial_success",
          message: "Student saved but image upload failed",
          data: student,
          imageError: imgErr.message || String(imgErr),
        });
      }
    }

    // ------------------- If class is a course id, assign course subjects to student -------------------
    try {
      const classVal = requestParams.class || null;
      const classId = classVal ? String(classVal) : null;
      if (classId) {
        const StudentServiceLocal = require("../services/StudentService");
        const schoolId = req.user ? (req.user.school_id || req.user.SchoolId || req.user.schoolId || null) : null;
        const studentIdToUse = student?._id || studentId || null;
        if (studentIdToUse) {
          await StudentServiceLocal.assignCourseToStudent(studentIdToUse, classId, schoolId);
        }
      }
    } catch (assignErr) {
      logger && logger.error && logger.error("saveStudentDetails: assignCourseToStudent failed:", assignErr);
    }

    // ------------------- SUCCESS -------------------
    return res.status(STATUS.OK).json({
      status: "success",
      data: student,
    });

  } catch (err) {
  logger && logger.error && logger.error("saveStudentDetails controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong while saving student",
      error: err.message,
    });
  }
};

const setStudentPassword = async (req, res) => {
  try {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8) return res.status(STATUS.BAD_REQUEST).json({ status: 'error', message: 'Password must be at least 8 characters' });
    const updated = await Student.findOneAndUpdate(
      { _id: req.params.id, school_id: req.schoolId },
      { $set: { password_hash: await bcrypt.hash(password, 12) } },
      { new: true },
    ).select('_id');
    if (!updated) return res.status(STATUS.NOT_FOUND).json({ status: 'error', message: 'Student not found' });
    return res.json({ status: 'success', message: 'Student password updated' });
  } catch (err) {
    logger && logger.error && logger.error('setStudentPassword error:', err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: 'error', message: 'Failed to update student password' });
  }
};


const updateStudent = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};

    if (!id) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "student id is required",
      });
    }

    const updated = await StudentService.updateStudent(id, payload);

    if (!updated) {
      return res.status(STATUS.NOT_FOUND).json({
        status: "error",
        message: "Student not found or nothing to update",
      });
    }

    return res.status(STATUS.OK).json({
      status: "success",
      data: updated,
    });
  } catch (err) {
  logger && logger.error && logger.error("updateStudent controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong while updating student",
      error: err.message,
    });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    logger.debug("getStudentDetails called with params:", req.params);
    const id = req.params.id;
    if (!id) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "student id is required",
      });
    }

    const result = await StudentService.getStudentDetails(id);

    if (!result || !result.studentData) {
      return res.status(STATUS.NOT_FOUND).json({
        status: "error",
        message: "Student not found",
      });
    }

    return res.status(STATUS.OK).json({
      status: "success",
      data: result,
    });
  } catch (err) {
  logger && logger.error && logger.error("getStudentDetails controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch student details",
      error: err.message,
    });
  }
};

const listStudents = async (req, res) => {
  try {
    // Merge all request sources
    const reqParams = {
      ...req.query,
      ...req.body,
      ...req.params
    };

    // Log request params (only place where request params are logged)
    logger && logger.debug && logger.debug("listStudents reqParams:", reqParams);

    // Extract pagination safely
    const page = Number(reqParams.page || 1);
    const limit = Number(reqParams.limit || 20);
    const query = (reqParams.q || "").trim();

    const result = await StudentService.listStudents({ 
      page, 
      limit, 
      query,
      reqParams, // optional if needed inside service
    });

    return res.status(STATUS.OK).json({
      status: "success",
      data: result,
    });

  } catch (err) {
  logger && logger.error && logger.error("listStudents controller error:", err);

    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to list students",
      error: err.message,
    });
  }
};

// List students filtered by class/course id (wrapper)
const listStudentsByClass = async (req, res) => {
  try {
    const courseId = req.params.id;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 1000);

    const result = await StudentService.listStudents({ page, limit, reqParams: { course_id: courseId } });

    return res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    logger && logger.error && logger.error('listStudentsByClass error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};


const deleteStudent = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "student id is required",
      });
    }

    const deleted = await StudentService.deleteStudent(id);

    if (!deleted) {
      return res.status(STATUS.NOT_FOUND).json({
        status: "error",
        message: "Student not found or could not be deleted",
      });
    }

    return res.status(STATUS.OK).json({
      status: "success",
      message: "Student deleted",
    });
  } catch (err) {
    logger && logger.error && logger.error("deleteStudent controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to delete student",
      error: err.message,
    });
  }
};

/**
 * Student subjects: list and set
 */
const listStudentSubjects = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "student id is required" });

    const subjects = await StudentService.getStudentSubjects(id);
    return res.status(STATUS.OK).json({ status: "success", data: subjects });
  } catch (err) {
    logger && logger.error && logger.error("listStudentSubjects controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch student subjects", error: err.message });
  }
};

const setStudentSubjects = async (req, res) => {
  try {
    const id = req.params.id;
    const requestParams = { ...req.query, ...req.body, ...req.params };
    console.log("setStudentSubjects called for student ID =", id, "with params:", requestParams);
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "student id is required" });

    const subjectIds = requestParams.subjects ||  [];
    console.log("Subject IDs to set:", subjectIds);

    // derive school_id from user if possible
    let schoolId = null;
    if (req.user) schoolId = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;

    const result = await StudentService.setStudentSubjects(id, subjectIds, schoolId);

    return res.status(STATUS.OK).json({ status: "success", data: result });
  } catch (err) {
    logger && logger.error && logger.error("setStudentSubjects controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to set student subjects", error: err.message });
  }
};

const setStudentCourse = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "student id is required" });

    const payload = req.body || {};
    const courseId = payload.course_id || payload.courseId || null;
    if (!courseId) return res.status(STATUS.BAD_REQUEST).json({ status: "error", message: "course_id is required" });

    let schoolId = null;
    if (req.user) schoolId = req.user.school_id || req.user.SchoolId || req.user.schoolId || null;

    const result = await StudentService.assignCourseToStudent(id, courseId, schoolId);

    return res.status(STATUS.OK).json({ status: "success", data: result });
  } catch (err) {
    logger && logger.error && logger.error("setStudentCourse controller error:", err);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to assign course to student", error: err.message });
  }
};

/**
 * Upload photo for a student.
 * Expects middleware (multer) to populate req.file
 * The service will persist image record and return new image data.
 */
const uploadStudentImage = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "student id is required",
      });
    }

    // multer fills req.file
    const file = req.file;
    if (!file) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "Image file is required (multipart/form-data)",
      });
    }

    // allow service to handle storage / record creation
    const image = await StudentService.saveStudentImage(id, file);

    if (!image) {
      return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Image upload failed",
      });
    }

    return res.status(STATUS.OK).json({
      status: "success",
      data: image,
    });
  } catch (err) {
    logger && logger.error && logger.error("uploadStudentImage controller error:", err);
    return res.status(STATUS.BAD_REQUEST).json({
      status: "error",
      message: err.message || "Failed to upload student image",
      error: err.message,
    });
  }
};

/**
 * Bulk import students from file (CSV/XLSX)
 */
const bulkImportStudents = async (req, res) => {
  try {
    const courseId = req.body?.course_id || req.query?.course_id
    const schoolId = req.user?.school_id || req.user?.SchoolId

    if (!courseId) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "course_id is required"
      })
    }

    if (!req.file) {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "No file uploaded"
      })
    }

    // Parse file (CSV or XLSX)
    let students = []
    const filename = req.file.originalname.toLowerCase()

    if (filename.endsWith('.csv')) {
      // Parse CSV
      const csv = require('csv-parse/sync')
      const records = csv.parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      students = records
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      // Parse XLSX
      const xlsx = require('xlsx')
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      students = xlsx.utils.sheet_to_json(sheet)
    } else {
      return res.status(STATUS.BAD_REQUEST).json({
        status: "error",
        message: "File must be CSV or XLSX"
      })
    }

    // Bulk import
    const result = await StudentService.bulkImportStudents(students, courseId, schoolId)

    return res.status(STATUS.OK).json({
      status: result.failed > 0 ? "partial" : "success",
      data: result
    })
  } catch (error) {
    logger && logger.error && logger.error('bulkImportStudents error:', error)
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Import failed: " + error.message
    })
  }
}

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
  bulkImportStudents
};
