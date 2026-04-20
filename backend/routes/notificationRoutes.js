const express = require("express");
const {
  createNotification,
  getNotifications,
  markAllRead,
  markRead,
} = require("../controllers/notificationController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/", protect, requireRole("ADMIN"), createNotification);
router.patch("/:id/read", protect, markRead);
router.post("/read-all", protect, markAllRead);

module.exports = router;
