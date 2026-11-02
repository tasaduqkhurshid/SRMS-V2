"use strict";

const SchoolService = require("../common/SchoolService");
const { Student, User } = require("../../db/models");
const { success, failure } = require("../../utils/serviceResult");

const listSchoolsWithStatistics = async () => {
  try {
    const result = await SchoolService.listSchools();
    if (result.error) return result;
    const schools = result.data;
    const [students, administrators] = await Promise.all([
      Student.countDocuments({}),
      User.countDocuments({ role: { $in: ["ADMIN", "SCHOOL_ADMIN"] } }),
    ]);
    return success({
      schools,
      statistics: {
        schools: schools.length,
        activeSchools: schools.filter((school) => school.status !== "inactive").length,
        inactiveSchools: schools.filter((school) => school.status === "inactive").length,
        students,
        schoolAdministrators: administrators,
      },
    });
  } catch (error) {
    return failure(error);
  }
};

module.exports = { listSchoolsWithStatistics };
