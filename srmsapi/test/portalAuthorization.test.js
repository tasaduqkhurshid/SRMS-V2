"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { requireSchoolAdmin, requireSuperAdmin } = require("../src/middleware/AuthService");

const invoke = (middleware, request) => {
  const response = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  middleware(request, response, () => { nextCalled = true; });
  return { response, nextCalled };
};

test("school and platform administrator guards remain isolated by portal and tenant", () => {
  const schoolAdmin = {
    isPlatformHost: false,
    schoolId: "school-a",
    user: { auth_type: "user", role: "SCHOOL_ADMIN", school_id: "school-a" },
  };
  const superAdmin = {
    isPlatformHost: true,
    user: { auth_type: "user", role: "SUPER_ADMIN", school_id: null },
  };

  assert.equal(invoke(requireSchoolAdmin, schoolAdmin).nextCalled, true);
  assert.equal(invoke(requireSuperAdmin, superAdmin).nextCalled, true);

  const schoolOnPlatformRoute = invoke(requireSuperAdmin, schoolAdmin);
  assert.equal(schoolOnPlatformRoute.nextCalled, false);
  assert.equal(schoolOnPlatformRoute.response.statusCode, 403);

  const platformOnSchoolRoute = invoke(requireSchoolAdmin, superAdmin);
  assert.equal(platformOnSchoolRoute.nextCalled, false);
  assert.equal(platformOnSchoolRoute.response.statusCode, 403);

  const wrongSchool = invoke(requireSchoolAdmin, {
    ...schoolAdmin,
    schoolId: "school-b",
  });
  assert.equal(wrongSchool.nextCalled, false);
  assert.equal(wrongSchool.response.statusCode, 403);
});