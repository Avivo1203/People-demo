const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// נתיבים פתוחים
router.post("/register", register);
router.post("/login", login);

// נתיב מוגן
router.get("/me", protect, getMe);

module.exports = router;