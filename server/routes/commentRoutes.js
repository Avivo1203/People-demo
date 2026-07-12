const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createComment,
  getCommentsByStatus,
} = require("../controllers/commentController");

// יצירת תגובה חדשה
router.post("/:statusId", protect, createComment);

// שליפת כל התגובות של סטטוס
router.get("/status/:statusId", protect, getCommentsByStatus);

module.exports = router;