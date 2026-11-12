const express = require("express");
const router = express.Router();
const controller = require("../../controllers/srms-school/NotificationController");
const { authenticateJwt, requireSchoolAdmin } = require("../../middleware/AuthService");

router.use(authenticateJwt, requireSchoolAdmin);

router.get("/", controller.getNotifications);
router.get("/unread-count", controller.getUnreadCount);
router.patch("/:id/read", controller.markAsRead);
router.patch("/read-all", controller.markAllAsRead);
router.delete("/:id", controller.deleteNotification);
router.delete("/", controller.deleteAllNotifications);

module.exports = router;