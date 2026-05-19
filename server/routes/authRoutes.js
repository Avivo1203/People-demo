const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // מייבאים את ההגנה

// נתיבים פתוחים (כל אחד יכול לגשת)
router.post('/register', register);
router.post('/login', login);

// נתיב מוגן - רק מי ששולח Token תקין יעבור את protect ויגיע ל-getMe
router.get('/me', protect, getMe);

module.exports = router;