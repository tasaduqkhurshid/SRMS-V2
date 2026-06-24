const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Redis cache
const RedisCacheService = require("./services/RedisCacheService");
RedisCacheService.initializeRedis().catch(err => {
  console.error("Failed to initialize Redis cache:", err);
  // App can still run without Redis, it will just skip caching
});

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// 🔥 Log every route hit
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json({ limit: "10mb" }));

// middleware
const { authenticateJwt } = require("./middleware/AuthService");


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
const logger = require("./utils/logger");

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Dynamic option routes (cached, no auth required for select dropdowns)
app.use("/options", DynamicOptionRoutes);

app.use("/students",authenticateJwt, StudentRoutes);
app.use("/subjects",authenticateJwt, SubjectRoutes);
app.use("/courses", authenticateJwt, CourseRoutes);
app.use("/exams", authenticateJwt, ExamRoutes);
app.use("/academic-years", authenticateJwt, AcademicYearRoutes);
app.use("/results", authenticateJwt, ResultRoutes);
app.use("/marksheet-templates", authenticateJwt, MarksheetTemplateRoutes);

app.use("/auth", AuthRoutes);
app.use("/school",authenticateJwt, SchoolRoutes);

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
