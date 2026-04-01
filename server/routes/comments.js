const express = require('express');
const router = express.Router();

// נתיב זמני לבדיקה שהכל עובד
router.get('/test', (req, res) => {
    res.send('comments route is working!');
});

module.exports = router; // השורה הזו היא הכי חשובה!