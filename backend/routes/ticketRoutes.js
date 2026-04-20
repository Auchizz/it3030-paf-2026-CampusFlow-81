const express = require("express");
const multer = require("multer");
const {
  createTicket,
  getTickets,
  updateTicketStatus,
} = require("../controllers/ticketController");
const { protect, requireRole } = require("../middleware/auth");
const uploadTicketImage = require("../middleware/upload");

const router = express.Router();

const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return next();
};

router.post("/", protect, uploadTicketImage.single("image"), handleUploadErrors, createTicket);
router.get("/", protect, getTickets);
router.put("/:id/status", protect, requireRole("ADMIN"), updateTicketStatus);

module.exports = router;
