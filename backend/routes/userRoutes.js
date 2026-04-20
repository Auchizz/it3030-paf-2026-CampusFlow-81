const express = require("express");
const { getUsers } = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, requireRole("ADMIN"), getUsers);

module.exports = router;
