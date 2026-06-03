const express = require("express");
const router = express.Router();

const ActiveLocation = require("../models/ActiveLocation");
const { protect } = require("../middleware/authMiddleware");

router.post("/activate", protect, async (req, res) => {
  try {
    const { lat, lng, radius, privacyMode } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ message: "חסר lat או lng" });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const activeLocation = await ActiveLocation.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        location: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        radius: Number(radius) || 1500,
        privacyMode: privacyMode || "visible",
        expiresAt,
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "המיקום נשמר ל-10 דקות",
      activeLocation,
    });
  } catch (error) {
    console.error("Activate location error:", error);
    res.status(500).json({ message: "שגיאת שרת בשמירת מיקום" });
  }
});

router.get("/nearby", protect, async (req, res) => {
  try {
    const radius = Number(req.query.radius) || 1500;

    const myLocation = await ActiveLocation.findOne({
      userId: req.userId,
      expiresAt: { $gt: new Date() },
    });

    if (!myLocation) {
      return res.status(404).json({
        message: "אין מיקום פעיל למשתמש. צריך להפעיל מיקום קודם.",
      });
    }

    const nearbyUsers = await ActiveLocation.find({
      userId: { $ne: req.userId },
      privacyMode: { $ne: "hidden" },
      expiresAt: { $gt: new Date() },
      location: {
        $near: {
          $geometry: myLocation.location,
          $maxDistance: radius,
        },
      },
    }).populate("userId", "username firstName lastName");

    const result = nearbyUsers.map((item) => {
      const [lng, lat] = item.location.coordinates;

      return {
        id: item._id,
        userId: item.userId?._id,
        username: item.userId?.username || "משתמש",
        firstName: item.userId?.firstName,
        lastName: item.userId?.lastName,
        privacyMode: item.privacyMode,
        lat: item.privacyMode === "visible" ? lat : null,
        lng: item.privacyMode === "visible" ? lng : null,
        radius: item.radius,
        expiresAt: item.expiresAt,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Nearby location error:", error);
    res.status(500).json({ message: "שגיאת שרת בחיפוש משתמשים קרובים" });
  }
});

router.delete("/deactivate", protect, async (req, res) => {
  try {
    await ActiveLocation.deleteOne({ userId: req.userId });

    res.json({ message: "המיקום כובה בהצלחה" });
  } catch (error) {
    console.error("Deactivate location error:", error);
    res.status(500).json({ message: "שגיאת שרת בכיבוי מיקום" });
  }
});

module.exports = router;