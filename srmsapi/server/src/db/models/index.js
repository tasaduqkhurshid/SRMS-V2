"use strict";

const mongoose = require("mongoose");
const path = require("path");

const db = {};

// Load all schemas from the schemas directory
const schemas = require("../schemas");
Object.assign(db, schemas);

// Get MongoDB URI from environment or use default
const getMongoUri = () => {
  return process.env.MONGO_URI || 
    (process.env.NODE_ENV === 'production' 
      ? require(path.join(__dirname, "../../config/config.json")).production.mongodb.uri
      : require(path.join(__dirname, "../../config/config.json")).development.mongodb.uri);
};

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    
    console.log("🔄 Connecting to MongoDB...");
    console.log(`   URI: ${mongoUri.replace(/\/\/.*:.*@/, '//<credentials>@')}`);
    
    await mongoose.connect(mongoUri, mongoOptions);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

// Connection event handlers
mongoose.connection.on("disconnected", () => {
  console.log("❌ MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error);
});

db.connectDB = connectDB;
db.mongoose = mongoose;

module.exports = db;