const express = require("express");
const {
  createBooking,
  getBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.put("/:id/status", protect, requireRole("ADMIN"), updateBookingStatus);

module.exports = router;
