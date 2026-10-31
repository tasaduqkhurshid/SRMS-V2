require("dotenv").config();
const logger = require("./src/utils/logger");
const app = require("./src/app");
const db = require("./src/db/models");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

logger.info(`🚀 Starting Server in ${process.env.NODE_ENV || 'development'} mode...`);

db.connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      logger.info(`✅ Database connected`);
      logger.info(`🌐 API running at http://${HOST}:${PORT}`);
    });
  })
  .catch((e) => {
    logger.error("❌ DB connection failed", e);
    process.exit(1);
  });
