require("dotenv").config();
require("./src/config/jwt").validateRuntimeConfig();
const logger = require("./src/utils/logger");
const app = require("./src/app");
const db = require("./src/db/models");
const { initializeSocket } = require("./src/services/common/SocketService");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

logger.info(`🚀 Starting Server in ${process.env.NODE_ENV || 'development'} mode...`);

db.connectDB()
  .then(() => {
    const server = app.listen(PORT, HOST, () => {
      logger.info(`✅ Database connected`);
      logger.info(`🌐 API running at http://${HOST}:${PORT}`);
    });

    initializeSocket(server);

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      const { shutdown } = require("./src/services/common/SocketService");
      await shutdown();
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((e) => {
    logger.error("❌ DB connection failed", e);
    process.exit(1);
  });
