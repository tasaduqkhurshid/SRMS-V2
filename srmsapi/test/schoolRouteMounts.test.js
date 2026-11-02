"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const schoolRoutes = require("../src/routes/srms-school");
const supportRoutes = require("../src/routes/srms-school/supportTicketRoutes");

test("school support ticket endpoints are mounted once at their client paths", () => {
  const supportLayer = schoolRoutes.stack.find((layer) => layer.name === "router" && layer.regexp.test("/"));
  assert.ok(supportLayer, "support ticket router is mounted at the school route root");
  assert.deepEqual(
    supportRoutes.stack.filter((layer) => layer.route).map((layer) => layer.route.path),
    [
      "/support-tickets/statistics",
      "/support-ticket-subjects",
      "/support-ticket-services",
      "/support-ticket-statuses",
      "/support-tickets",
      "/support-tickets",
      "/support-tickets/:id",
      "/support-tickets/:id/replies",
    ],
  );
});