"use strict";

const mongoose = require("mongoose");
const tenantScopePlugin = require("../../middleware/tenantScopePlugin");
const logger = require("../../utils/logger");
const { getDatabaseConfig } = require("../../config/database");

mongoose.set("debug", String(process.env.MONGO_DEBUG || "false").toLowerCase() === "true");
mongoose.plugin(tenantScopePlugin);

const db = {};
const schemas = require("../schemas");
Object.assign(db, schemas);

const connectDB = async () => {
  let config;
  try {
    config = getDatabaseConfig();
    logger.info(`Database configuration:\n  Type      : ${config.type}\n  Host      : ${config.host}\n  Port      : ${config.port}\n  Database  : ${config.name}`);
    await mongoose.connect(config.uri);
    logger.info("Connected to MongoDB successfully.");
  } catch (error) {
    const target = config ? ` (${config.type} at ${config.host}:${config.port}/${config.name})` : '';
    logger.error(`MongoDB connection failed${target}:`, error.message);
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error:", error.message);
});

db.connectDB = connectDB;
db.mongoose = mongoose;

module.exports = db;
