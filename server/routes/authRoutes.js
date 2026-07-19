const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// נתיבים פתוחים
router.post("/register", register);
router.post("/login", login);

// שחזור סיסמה
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// נתיב מוגן
router.get("/me", protect, getMe);

module.exports = router;