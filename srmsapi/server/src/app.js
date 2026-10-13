const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { authenticateJwt, requireSchoolAdmin } = require("./middleware/AuthService");
const { resolveTenant, requirePlatformHost } = require("./middleware/tenantResolver");
const PlatformAdminRoutes = require("./routes/platformAdminRoutes");
const { errorHandler, notFoundHandler, asyncHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const SENSITIVE_QUERY_PARAMS = new Set([
  "password",
  "pin",
  "token",
  "secret",
  "authorization",
  "api_key",
  "apikey",
  "access_token",
  "refresh_token",
]);

const sanitizeUrl = (url) => {
  try {
    const parsed = new URL(url, `http://${url.split("/")[0]}`);
    for (const param of SENSITIVE_QUERY_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, "[REDACTED]");
      }
    }
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
};

// Initialize Redis cache
const RedisCacheService = require("./services/RedisCacheService");
RedisCacheService.initializeRedis().catch(err => {
  logger.error("Failed to initialize Redis cache", err);
});

const app = express();
app.set("trust proxy", process.env.TRUST_PROXY === "1" ? 1 : false);
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:3000"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Request logging middleware
app.use((req, res, next) => {
  req.requestId = req.headers["x-request-id"] || require("crypto").randomUUID();
  logger.debug(`${req.method} ${sanitizeUrl(req.originalUrl)}`, {
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(resolveTenant);

const AuthRoutes = require("./routes/authRoutes");
const SchoolRoutes = require("./routes/schoolRoutes");
const StudentRoutes = require("./routes/studentRoutes");
const SubjectRoutes = require("./routes/subjectRoutes");
const CourseRoutes = require("./routes/courseRoutes");
const ExamRoutes = require("./routes/examRoutes");
const AcademicYearRoutes = require("./routes/academicYearRoutes");
const ResultRoutes = require("./routes/resultRoutes");
const MarksheetTemplateRoutes = require("./routes/marksheetTemplateRoutes");
const DynamicOptionRoutes = require("./routes/DynamicOptionRoutes");
const StudentPortalRoutes = require("./routes/studentPortalRoutes");

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

const mountAdminApi = (prefix) => {
  app.use(`${prefix}/auth`, AuthRoutes);
  app.use(`${prefix}/options`, authenticateJwt, requireSchoolAdmin, DynamicOptionRoutes);
  app.use(`${prefix}/students`, authenticateJwt, requireSchoolAdmin, StudentRoutes);
  app.use(`${prefix}/subjects`, authenticateJwt, requireSchoolAdmin, SubjectRoutes);
  app.use(`${prefix}/courses`, authenticateJwt, requireSchoolAdmin, CourseRoutes);
  app.use(`${prefix}/exams`, authenticateJwt, requireSchoolAdmin, ExamRoutes);
  app.use(`${prefix}/academic-years`, authenticateJwt, requireSchoolAdmin, AcademicYearRoutes);
  app.use(`${prefix}/results`, authenticateJwt, requireSchoolAdmin, ResultRoutes);
  app.use(`${prefix}/marksheet-templates`, authenticateJwt, requireSchoolAdmin, MarksheetTemplateRoutes);
  app.use(`${prefix}/school`, authenticateJwt, requireSchoolAdmin, SchoolRoutes);
};

app.use('/api/admin/auth', requirePlatformHost, AuthRoutes);
app.use('/api/admin', authenticateJwt, require("./middleware/AuthService").requireSuperAdmin, PlatformAdminRoutes);
mountAdminApi("");
app.use("/api/student", StudentPortalRoutes);

app.use("/api", notFoundHandler);
app.use(errorHandler);

module.exports = app;
module.exports.asyncHandler = asyncHandler;