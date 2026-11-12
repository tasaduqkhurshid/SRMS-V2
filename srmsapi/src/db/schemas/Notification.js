"use strict";

const mongoose = require("mongoose");
const tableNames = require("../tableNames");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      required: true,
      enum: ["SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"],
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      index: true,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      required: true,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "academic",
        "student",
        "examination",
        "result",
        "attendance",
        "fees",
        "system",
        "support",
        "admission",
        "announcement",
      ],
      default: "system",
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceModel: {
      type: String,
      trim: true,
      default: null,
    },
    actionUrl: {
      type: String,
      trim: true,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: tableNames.notifications,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ schoolId: 1, createdAt: -1 });
notificationSchema.index({ referenceId: 1, referenceModel: 1 });

module.exports = mongoose.model("Notification", notificationSchema);