const logger = require("./src/utils/logger");
const app = require("./src/app");
const db = require("./src/db/models");
const PORT = process.env.PORT || 5050;

// Set DEBUG mode for development
if (process.env.NODE_ENV !== 'production') {
  process.env.DEBUG = 'true';
}

logger.info(`🚀 Starting Server in ${process.env.NODE_ENV || 'development'} mode...`);

db.connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`✅ Database connected`);
      logger.info(`🌐 API running at http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    logger.error("❌ DB connection failed", e);
    process.exit(1);
  });
