const express = require('express');
const router = express.Router();
const Status = require('../Models/Status'); // וודא שהקובץ הזה קיים בתיקיית Models

// 1. נתיב לקבלת כל הסטטוסים (כדי להציג אותם ב-Feed)
router.get('/', async (req, res) => {
    try {
        const statuses = await Status.find().sort({ createdAt: -1 }); // מביא את החדשים ביותר ראשונים
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ msg: "שגיאה במשיכת הסטטוסים" });
    }
});

// 2. נתיב לפרסום סטטוס חדש (זה מה שהיה חסר!)
router.post('/', async (req, res) => {
    try {
        const { content, user } = req.body;

        if (!content) {
            return res.status(400).json({ msg: "נא להזין תוכן לסטטוס" });
        }

        const newStatus = new Status({
            content,
            user, // כאן עובר ה-nickname או ה-ID מה-Frontend
            createdAt: new Date()
        });

        const savedStatus = await newStatus.save();
        res.status(201).json(savedStatus);
    } catch (err) {
        console.error("Error saving status:", err);
        res.status(500).json({ msg: "שגיאה בשרת בזמן שמירת הסטטוס" });
    }
});

module.exports = router;