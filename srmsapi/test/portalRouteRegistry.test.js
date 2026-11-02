"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const registerRoutes = require("../src/routes");
const { authenticateJwt, requireSchoolAdmin, requireSuperAdmin } = require("../src/middleware/AuthService");
const { requirePlatformHost } = require("../src/middleware/tenantResolver");
const adminRoutes = require("../src/routes/srms-admin");
const adminSupportRoutes = require("../src/routes/srms-admin/supportTicketAdminRoutes");

const routePaths = (router) => router.stack
  .filter((layer) => layer.route)
  .map((layer) => layer.route.path);

test("API route registry exposes intended portal namespaces with explicit guards", () => {
  const registrations = [];
  registerRoutes({ use: (...args) => registrations.push(args) });

  const hasPrefix = (prefix) => registrations.some(([path]) => path === prefix);
  assert.ok(hasPrefix("/api/school-admin"));
  assert.ok(hasPrefix("/api/admin"));
  assert.ok(hasPrefix("/api/student"));
  assert.ok(hasPrefix("/api/common"));

  const adminMount = registrations.find(([path, ...handlers]) => path === "/api/admin" && handlers.includes(adminRoutes));
  assert.ok(adminMount, "platform routes should have one canonical mount");
  assert.ok(adminMount.includes(requirePlatformHost));
  assert.ok(adminMount.includes(authenticateJwt));
  assert.ok(adminMount.includes(requireSuperAdmin));

  const schoolMount = registrations.find(([path, ...handlers]) => path === "/api/school-admin" && handlers.some((handler) => handler.name === "authenticateJwt"));
  assert.ok(schoolMount);
  assert.ok(schoolMount.includes(requireSchoolAdmin));
});

test("platform support endpoints use one support-tickets path segment", () => {
  assert.ok(adminRoutes.stack.some((layer) => layer.name === "router" && layer.regexp.test("/")));
  const actualPaths = routePaths(adminSupportRoutes);
  assert.ok(actualPaths.includes("/support-tickets/statistics"));
  assert.ok(actualPaths.includes("/support-tickets"));
  assert.ok(actualPaths.includes("/support-ticket-subjects"));
  assert.ok(actualPaths.includes("/support-ticket-services"));
  assert.ok(actualPaths.includes("/support-ticket-statuses"));
  assert.ok(!actualPaths.some((path) => path.startsWith("/support-tickets/support-tickets")));
});
