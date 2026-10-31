const express = require("express");
const cors = require("cors");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");
const dotenv = require("dotenv");
dotenv.config();

const { authenticateJwt, requireSchoolAdmin } = require("./middleware/AuthService");
const { resolveTenant, requirePlatformHost } = require("./middleware/tenantResolver");
const PlatformAdminRoutes = require("./routes/platformAdminRoutes");
const { errorHandler, notFoundHandler, asyncHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const RedisCacheService = require("./services/RedisCacheService");

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
RedisCacheService.initializeRedis().catch(err => {
  logger.error("Failed to initialize Redis cache", err);
});

// Initialize Redis client for session store
const redisClient = createClient({ url: process.env.REDIS_URL || "redis://redis:6379" });
redisClient.connect().catch(err => {
  logger.error("Failed to connect Redis for sessions", err);
});

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "srms:session:",
});

const app = express();
app.set("trust proxy", process.env.TRUST_PROXY === "1" ? 1 : false);
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:3000"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(session({
  store: redisStore,
  secret: process.env.JWT_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12, // 12 hours
    sameSite: "lax",
  },
  name: "srms.sid",
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

app.use(express.json({ limit: "10mb", verify: (req, _res, buffer) => { req.rawBody = Buffer.from(buffer); } }));
app.use(resolveTenant);

const AuthRoutes = require("./routes/authRoutes");
const SchoolPortalRoutes = require("./routes/srms-school");
const StudentPortalRoutes = require("./routes/studentPortalRoutes");

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

// School-specific auth routes (accessible via school subdomain like hanfia.sms.local)
app.use('/auth', AuthRoutes);

// Public school branding route (no auth required, uses tenant resolution)
app.use('/school', require("./routes/srms-school/schoolRoutes"));
app.use('/api/school', require("./routes/srms-school/schoolRoutes"));

const mountAdminApi = (prefix) => {
  app.use(`${prefix}/auth`, AuthRoutes);
  app.use(`${prefix}`, authenticateJwt, requireSchoolAdmin, SchoolPortalRoutes);
};

app.use('/api/admin/auth', requirePlatformHost, AuthRoutes);
app.use('/api/admin', authenticateJwt, requireSchoolAdmin, SchoolPortalRoutes);
app.use('/api/platform', authenticateJwt, require("./middleware/AuthService").requireSuperAdmin, PlatformAdminRoutes);
mountAdminApi("/admin");
mountAdminApi("");  // Also mount at root for nginx rewrites
app.use("/api/student", StudentPortalRoutes);

app.use("/api", notFoundHandler);
app.use(errorHandler);

module.exports = app;
module.exports.asyncHandler = asyncHandler;
