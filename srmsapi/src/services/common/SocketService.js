"use strict";

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User, Student, School } = require("../../db/models");
const { getJwtSecret } = require("../../config/jwt");
const logger = require("../../utils/logger");

let io = null;
const userSockets = new Map();
const userRooms = new Map();

const initializeSocket = (httpServer) => {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = jwt.verify(token, getJwtSecret());

      if (payload.token_type === "student") {
        const student = await Student.findById(payload.student_id || payload.id).lean();
        if (!student || String(student.school_id) !== String(payload.school_id)) {
          return next(new Error("Student account no longer exists"));
        }

        socket.user = {
          id: student._id.toString(),
          student_id: student._id.toString(),
          role: "STUDENT",
          school_id: student.school_id.toString(),
          auth_type: "student",
        };
        return next();
      }

      const user = await User.findById(payload.id).lean();
      if (!user) {
        return next(new Error("User no longer exists"));
      }

      const isSuperAdmin = String(user.role).toUpperCase() === "SUPER_ADMIN";
      const validPortalIdentity = isSuperAdmin && !user.school_id;

      socket.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        school_id: user.school_id?.toString() || null,
        student_id: user.student_id?.toString() || null,
        linked_student_ids: Array.isArray(user.linked_student_ids) ? user.linked_student_ids.map((id) => id.toString()) : [],
        auth_type: "user",
        isSuperAdmin: validPortalIdentity,
      };
      next();
    } catch (err) {
      logger.warn("Socket authentication failed:", err.message);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const schoolId = socket.user.school_id;
    const role = socket.user.role;

    logger.info(`Socket connected: ${userId} (${role})`);

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.join(`user:${userId}`);

    if (schoolId) {
      socket.join(`school:${schoolId}`);
    }

    if (socket.user.auth_type === "student") {
      socket.join(`student:${socket.user.student_id}`);
    } else if (socket.user.auth_type === "user") {
      if (socket.user.isSuperAdmin) {
        socket.join("role:SUPER_ADMIN");
      } else if (schoolId) {
        socket.join(`school-admin:${schoolId}`);
      }
    }

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${userId} - ${reason}`);

      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });

    socket.on("notification:join", (data) => {
      if (data?.room === "notifications") {
        socket.join(`user:${userId}:notifications`);
      }
    });

    socket.on("notification:leave", (data) => {
      if (data?.room === "notifications") {
        socket.leave(`user:${userId}:notifications`);
      }
    });
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, data) => {
  if (!io) return false;
  io.to(`user:${userId}`).emit(event, data);
  return true;
};

const emitToSchool = (schoolId, event, data) => {
  if (!io) return false;
  io.to(`school:${schoolId}`).emit(event, data);
  return true;
};

const emitToRole = (role, event, data) => {
  if (!io) return false;
  io.to(`role:${role}`).emit(event, data);
  return true;
};

const emitToSchoolAdmins = (schoolId, event, data) => {
  if (!io) return false;
  io.to(`school-admin:${schoolId}`).emit(event, data);
  return true;
};

const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

const getOnlineUsers = () => {
  return Array.from(userSockets.keys());
};

const getConnectedSocketsCount = () => {
  let count = 0;
  for (const sockets of userSockets.values()) {
    count += sockets.size;
  }
  return count;
};

const shutdown = async () => {
  if (io) {
    await io.close();
    io = null;
    userSockets.clear();
    userRooms.clear();
    logger.info("Socket.IO server shut down");
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToSchool,
  emitToRole,
  emitToSchoolAdmins,
  isUserOnline,
  getOnlineUsers,
  getConnectedSocketsCount,
  shutdown,
};