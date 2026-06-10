const express = require("express");
const router = express.Router();

const AreaStatus = require("../models/AreaStatus");
const ActiveLocation = require("../models/ActiveLocation");
const { protect } = require("../middleware/authMiddleware");

const DEFAULT_RADIUS = 1500;
const MAX_RADIUS = 5000;
const STATUS_TTL_HOURS = 24;

function normalizeRadius(value) {
  const radius = Number(value);

  if (!Number.isFinite(radius) || radius <= 0) {
    return DEFAULT_RADIUS;
  }

  return Math.min(radius, MAX_RADIUS);
}

router.post("/", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "חסר תוכן לסטטוס" });
    }

    const myLocation = await ActiveLocation.findOne({
      userId: req.userId,
      expiresAt: { $gt: new Date() },
    });

    if (!myLocation) {
      return res.status(400).json({
        message: "צריך להפעיל מיקום לפני פרסום סטטוס",
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + STATUS_TTL_HOURS * 60 * 60 * 1000);

    const status = await AreaStatus.create({
      userId: req.userId,
      text: text.trim(),
      location: myLocation.location,
      expiresAt,
    });

    res.status(201).json({
      message: "הסטטוס נשמר באזור ל-24 שעות",
      status,
    });
  } catch (error) {
    console.error("Create area status error:", error);
    res.status(500).json({ message: "שגיאת שרת ביצירת סטטוס" });
  }
});

router.get("/nearby", protect, async (req, res) => {
  try {
    const radius = normalizeRadius(req.query.radius);

    const myLocation = await ActiveLocation.findOne({
      userId: req.userId,
      expiresAt: { $gt: new Date() },
    });

    if (!myLocation) {
      return res.status(404).json({
        message: "צריך להפעיל מיקום כדי לראות סטטוסים באזור",
      });
    }

    const statuses = await AreaStatus.find({
      expiresAt: { $gt: new Date() },
      location: {
        $near: {
          $geometry: myLocation.location,
          $maxDistance: radius,
        },
      },
    })
      .populate("userId", "username firstName lastName")
      .sort({ createdAt: -1 });

    const result = statuses.map((status) => {
      const [lng, lat] = status.location.coordinates;

      return {
        id: status._id,
        userId: status.userId?._id,
        username: status.userId?.username || "משתמש",
        firstName: status.userId?.firstName,
        lastName: status.userId?.lastName,
        text: status.text,
        lat,
        lng,
        createdAt: status.createdAt,
        expiresAt: status.expiresAt,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Nearby area statuses error:", error);
    res.status(500).json({ message: "שגיאת שרת בשליפת סטטוסים באזור" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const status = await AreaStatus.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!status) {
      return res.status(404).json({
        message: "סטטוס לא נמצא או שאין הרשאה למחוק אותו",
      });
    }

    res.json({ message: "הסטטוס נמחק בהצלחה" });
  } catch (error) {
    console.error("Delete area status error:", error);
    res.status(500).json({ message: "שגיאת שרת במחיקת סטטוס" });
  }
});

module.exports = router;