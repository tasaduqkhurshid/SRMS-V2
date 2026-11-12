"use strict";

const SchoolService = require("../common/SchoolService");
const { Student, User } = require("../../db/models");
const { success, failure } = require("../../utils/serviceResult");

const getDashboardStatistics = async () => {
  try {
    const schoolsResult = await SchoolService.listSchools();
    if (schoolsResult.error) return schoolsResult;

    const schools = schoolsResult.data;

    const [students, administrators] = await Promise.all([
      Student.countDocuments({}),
      User.countDocuments({ role: { $in: ["ADMIN", "SCHOOL_ADMIN"] } }),
    ]);

    return success({
      schools: schools.length,
      activeSchools: schools.filter((school) => school.status !== "inactive").length,
      inactiveSchools: schools.filter((school) => school.status === "inactive").length,
      students,
      schoolAdministrators: administrators,
    });
  } catch (error) {
    return failure(error);
  }
};

module.exports = { getDashboardStatistics };
