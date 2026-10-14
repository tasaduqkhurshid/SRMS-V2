"use strict";

const SchoolService = require("../services/SchoolService");
const { Student, User } = require("../db/models");
const {
  ValidationError,
  NotFoundError,
} = require("../utils/applicationErrors");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../utils/responseHelpers");

const listSchools = asyncHandler(async (_req, res, next) => {
  const result = await SchoolService.listSchools();
  if (result.error) return next(result.error);

  const schools = result.data;
  const [totalStudents, totalUsers] = await Promise.all([
    Student.countDocuments({}),
    User.countDocuments({ role: { $in: ["ADMIN", "SCHOOL_ADMIN"] } }),
  ]);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Schools retrieved",
    data: {
      schools,
      statistics: {
        schools: schools.length,
        activeSchools: schools.filter((s) => s.status !== "inactive").length,
        inactiveSchools: schools.filter((s) => s.status === "inactive").length,
        students: totalStudents,
        schoolAdministrators: totalUsers,
      },
    },
  });
});

const createSchool = asyncHandler(async (req, res, next) => {
  const { school: schoolData } = req.body || {};
  if (!schoolData) {
    throw new ValidationError("School data is required");
  }
  const result = await SchoolService.registerSchool({
    school: schoolData,
    admin: null,
  });
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: "School created",
    data: {
      school_id: result.data._id,
      school_name: result.data.school_name,
      slug: result.data.slug,
    },
  });
});

const getSchool = asyncHandler(async (req, res, next) => {
  const result = await SchoolService.getSchoolById(req.params.id);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("School");
  }
  const school = result.data;
  const schoolId = school._id;
  const [administrators, students, teachers] = await Promise.all([
    User.countDocuments({
      school_id: schoolId,
      role: { $in: ["ADMIN", "SCHOOL_ADMIN"] },
    }),
    Student.countDocuments({ school_id: schoolId }),
    User.countDocuments({
      school_id: schoolId,
      role: { $regex: /^teacher$/i },
    }),
  ]);
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "School retrieved",
    data: { ...school, statistics: { administrators, students, teachers } },
  });
});

const updateSchool = asyncHandler(async (req, res, next) => {
  const result = await SchoolService.updatePlatformSchool(
    req.params.id,
    req.body || {},
  );
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("School");
  }
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "School updated",
    data: result.data,
  });
});

const listAdministrators = asyncHandler(async (req, res, next) => {
  const result = await SchoolService.listSchoolAdministrators(req.params.id);
  if (result.error) return next(result.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Administrators retrieved",
    data: result.data,
  });
});

const updateAdministrator = asyncHandler(async (req, res, next) => {
  const { email } = req.body || {};
  if (!email) {
    throw new ValidationError("Email is required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Please enter a valid email address");
  }
  const result = await SchoolService.updateSchoolAdministrator(
    req.params.id,
    req.params.adminId,
    { email },
  );
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("School administrator");
  }
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "Administrator updated",
    data: {
      id: result.data._id,
      username: result.data.username,
      email: result.data.email,
      role: result.data.role,
    },
  });
});

const deleteAdministrator = asyncHandler(async (req, res, next) => {
  const result = await SchoolService.deleteSchoolAdministrator(
    req.params.id,
    req.params.adminId,
  );
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("School administrator");
  }
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "School administrator deleted",
  });
});

const updateAdministratorPassword = asyncHandler(async (req, res, next) => {
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }
  const result = await SchoolService.updateSchoolAdministratorPassword(
    req.params.id,
    req.params.adminId,
    password,
  );
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("School administrator");
  }
  return sendSuccessJsonResponse(res, {
    statusCode: 200,
    message: "School administrator password updated",
  });
});

const createAdministrator = asyncHandler(async (req, res, next) => {
  const result = await SchoolService.getSchoolById(req.params.id);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("School");
  }
  const adminResult = await SchoolService.createSchoolAdministrator(
    req.params.id,
    req.body || {},
  );
  if (adminResult.error) return next(adminResult.error);

  return sendSuccessJsonResponse(res, {
    statusCode: 201,
    message: "Administrator created",
    data: {
      id: adminResult.data._id,
      username: adminResult.data.username,
      email: adminResult.data.email,
      role: adminResult.data.role,
    },
  });
});

module.exports = {
  listSchools,
  createSchool,
  getSchool,
  updateSchool,
  listAdministrators,
  createAdministrator,
  updateAdministrator,
  deleteAdministrator,
  updateAdministratorPassword,
};
