const express = require("express");
const {
  createResource,
  getResources,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireRole("ADMIN"), createResource);
router.get("/", protect, getResources);
router.put("/:id", protect, requireRole("ADMIN"), updateResource);
router.delete("/:id", protect, requireRole("ADMIN"), deleteResource);

module.exports = router;
