const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const { authenticateJwt, requireSchoolAdmin } = require("./middleware/AuthService");
const { resolveTenant, requirePlatformHost } = require("./middleware/tenantResolver");
const PlatformAdminRoutes = require("./routes/platformAdminRoutes");

// Initialize Redis cache
const RedisCacheService = require("./services/RedisCacheService");
RedisCacheService.initializeRedis().catch(err => {
  console.error("Failed to initialize Redis cache:", err);
  // App can still run without Redis, it will just skip caching
});

const app = express();
app.set("trust proxy", process.env.TRUST_PROXY === "1" ? 1 : false);
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:3000"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// 🔥 Log every route hit
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
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
const logger = require("./utils/logger");

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

// School-admin API retains its existing resource paths. Platform APIs exist only on admin.<root domain>.
app.use('/api/admin/auth', requirePlatformHost, AuthRoutes);
app.use('/api/admin', authenticateJwt, require("./middleware/AuthService").requireSuperAdmin, PlatformAdminRoutes);
mountAdminApi("");
app.use("/api/student", StudentPortalRoutes);

app.use((req, res, next) => {
  const ingressPath = String(req.get("x-original-uri") || req.originalUrl).split("?")[0];
  if (ingressPath.startsWith("/api/")) {
    return res.status(404).json({ status: "error", message: "API endpoint not found" });
  }
  return next();
});

app.use("/api", (req, res) =>
  res.status(404).json({ status: "error", message: "API endpoint not found" })
);

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.error(`[${req.method}] ${req.originalUrl}:`, err);
  return res.status(500).json({ 
    status: "error", 
    message: "Internal server error", 
    error: err.message 
  });
});

module.exports = app;
