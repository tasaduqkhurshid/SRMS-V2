"use strict";

const db = require('../models');
const logger = require('../../utils/logger');
const { getDatabaseConfig } = require('../../config/database');

async function resetDatabase() {
  const config = getDatabaseConfig();
  try {
    await db.connectDB();
    logger.warn(`Dropping selected database ${config.name} on ${config.type} host ${config.host}:${config.port}`);
    await db.mongoose.connection.dropDatabase();
    logger.info(`Database ${config.name} was reset`);
  } finally {
    await db.mongoose.connection.close();
  }
}

if (require.main === module) {
  resetDatabase().catch((error) => {
    logger.error('Database reset failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { resetDatabase };
