"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { School } = require("../src/db/models");
const { resolveTenant, slugFromHostname } = require("../src/middleware/tenantResolver");

test("hostname tenant parsing accepts public, nested student, and local school hosts", () => {
  assert.equal(slugFromHostname("hanfia.example.test", "example.test"), "hanfia");
  assert.equal(slugFromHostname("hanfia.sms.local", "sms.local"), "hanfia");
  assert.equal(slugFromHostname("student.hanfia.example.test", "example.test"), null);
  assert.equal(slugFromHostname("student.student.example.test", "example.test"), null);
  assert.equal(slugFromHostname("student.hanfia.other.test", "example.test"), null);
  assert.equal(slugFromHostname("Hanfia.example.test", "example.test"), "hanfia");
});

test("tenant resolver rejects unknown, inactive, invalid, and reserved public school hosts", async () => {
  const oldRootDomain = process.env.ROOT_DOMAIN;
  const originalFindOne = School.findOne;
  process.env.ROOT_DOMAIN = "sms.local";

  const resolveRequest = async (host, path, lookup) => {
    School.findOne = (query) => ({ lean: async () => lookup(query.slug) });
    const response = { statusCode: null, body: null };
    response.status = (code) => { response.statusCode = code; return response; };
    response.json = (body) => { response.body = body; return response; };
    let nextCalled = false;
    const request = { path, get: (name) => name === "host" ? host : undefined };
    await resolveTenant(request, response, () => { nextCalled = true; });
    return { request, response, nextCalled };
  };

  try {
    const activeSchool = { _id: "school-id", slug: "hanfia", status: "active" };
    for (const host of ["hanfia.sms.local", "hanfia.sms.local:80"]) {
      const result = await resolveRequest(host, "/api/student/auth/login", () => activeSchool);
      assert.equal(result.nextCalled, true);
      assert.equal(result.request.school.slug, "hanfia");
    }

    const unknown = await resolveRequest("missing.sms.local", "/api/student/auth/login", () => null);
    assert.equal(unknown.response.statusCode, 404);

    const inactive = await resolveRequest("inactive.sms.local", "/api/student/auth/login", () => ({
      _id: "inactive-id", slug: "inactive", status: "inactive",
    }));
    assert.equal(inactive.response.statusCode, 403);

    const invalid = await resolveRequest("student.student.sms.local", "/api/student/auth/login", () => null);
    assert.equal(invalid.response.statusCode, 400);

    const platformApi = await resolveRequest("admin.sms.local", "/api/admin/auth/login", () => null);
    assert.equal(platformApi.nextCalled, true);
    assert.equal(platformApi.request.isPlatformHost, true);
  } finally {
    School.findOne = originalFindOne;
    if (oldRootDomain === undefined) delete process.env.ROOT_DOMAIN;
    else process.env.ROOT_DOMAIN = oldRootDomain;
  }
});
