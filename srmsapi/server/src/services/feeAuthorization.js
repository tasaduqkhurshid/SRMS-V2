"use strict";

const { AuthorizationError } = require("../utils/applicationErrors");

const assertPortalStudentAccess = (user, studentId) => {
  const schoolId = user?.school_id;
  if (!schoolId) throw new AuthorizationError("A school account is required");
  if (user.auth_type === "student") {
    if (String(user.student_id) !== String(studentId)) {
      throw new AuthorizationError("Students can access only their own fee records");
    }
    return true;
  }
  if (user.auth_type === "user" && String(user.role || "").toUpperCase() === "PARENT") {
    const linkedIds = Array.isArray(user.linked_student_ids) ? user.linked_student_ids.map(String) : [];
    if (linkedIds.includes(String(studentId))) return true;
    throw new AuthorizationError("This student is not linked to your parent account");
  }
  throw new AuthorizationError("Fee portal access is not available for this account");
};

module.exports = { assertPortalStudentAccess };
