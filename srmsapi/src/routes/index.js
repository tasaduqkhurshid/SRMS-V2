"use strict";

const AuthRoutes = require("./common/authRoutes");
const SchoolPortalRoutes = require("./srms-school");
const AdminPortalRoutes = require("./srms-admin");
const CommonRoutes = require("./common");
const StudentPortalRoutes = require("./studentPortalRoutes");
const { authenticateJwt, requireSchoolAdmin, requireSuperAdmin } = require("../middleware/AuthService");
const { requirePlatformHost } = require("../middleware/tenantResolver");

const mountLegacySchoolRoutes = (app, prefix) => {
  app.use(`${prefix}/auth`, AuthRoutes);
  app.use(prefix, authenticateJwt, requireSchoolAdmin, SchoolPortalRoutes);
};

const registerRoutes = (app) => {
  app.use("/auth", AuthRoutes);
  app.use("/school", require("./srms-school/schoolRoutes"));
  app.use("/api/school", require("./srms-school/schoolRoutes"));

  app.use("/api/admin/auth", requirePlatformHost, AuthRoutes);
  app.use("/api/admin", requirePlatformHost, authenticateJwt, requireSuperAdmin, AdminPortalRoutes);
  app.use("/api/school-admin/auth", AuthRoutes);
  app.use("/api/school-admin", authenticateJwt, requireSchoolAdmin, SchoolPortalRoutes);
  app.use("/api/student", StudentPortalRoutes);
  app.use("/api/common", CommonRoutes);

  // Keep old paths until school clients and deployed proxy rules are migrated.
  mountLegacySchoolRoutes(app, "/admin");
  mountLegacySchoolRoutes(app, "");
};

module.exports = registerRoutes;