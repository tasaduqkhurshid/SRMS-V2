const express = require("express");
const router = express.Router();
const controller = require("../../controllers/srms-admin/notificationController");
const { authenticateJwt, requireSuperAdmin } = require("../../middleware/AuthService");
const { requirePlatformHost } = require("../../middleware/tenantResolver");

router.use(requirePlatformHost, authenticateJwt, requireSuperAdmin);

router.get("/", controller.getNotifications);
router.get("/unread-count", controller.getUnreadCount);
router.patch("/:id/read", controller.markAsRead);
router.patch("/read-all", controller.markAllAsRead);
router.delete("/:id", controller.deleteNotification);
router.delete("/", controller.deleteAllNotifications);
router.post("/announcement", controller.sendSystemAnnouncement);

module.exports = router;