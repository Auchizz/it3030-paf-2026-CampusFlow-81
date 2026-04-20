const express = require("express");
const { createAdmin, login, me, register } = require("../controllers/authController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/admins", protect, requireRole("ADMIN"), createAdmin);

module.exports = router;
