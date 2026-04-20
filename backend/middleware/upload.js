const fs = require("fs");
const path = require("path");
const multer = require("multer");

const ticketUploadDir = path.join(__dirname, "..", "uploads", "tickets");

fs.mkdirSync(ticketUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ticketUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);

    cb(null, `ticket-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }

  return cb(null, true);
};

const uploadTicketImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadTicketImage;
