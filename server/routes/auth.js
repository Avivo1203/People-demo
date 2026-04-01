const express = require('express');
const router = express.Router();
const User = require('../Models/User'); // וודא שהתיקייה היא Models עם M גדולה כפי שכתבת
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. נתיב בדיקה
router.get('/test', (req, res) => {
    res.send('השרת מזהה את נתיבי ה-Auth!');
});

// 2. נתיב הרישום (Register)
router.post('/register', async (req, res) => {
    try {
        const { nickname, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'משתמש קיים' });

        user = new User({ nickname, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(201).json({ msg: 'נרשם בהצלחה' });
    } catch (err) {
        console.error(err);
        res.status(500).send('שגיאת שרת ברישום');
    }
});

// 3. נתיב ההתחברות (Login) - זה מה שהיה חסר לך!
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // בדיקה אם המשתמש קיים
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'משתמש לא נמצא' });
        }

        // השוואת סיסמה
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'סיסמה שגויה' });
        }

        // יצירת טוקן (JWT)
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '1h' }
        );

        // שליחת תגובה עם פרטי המשתמש
        res.json({
            token,
            nickname: user.nickname,
            email: user.email
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('שגיאת שרת בהתחברות');
    }
});

module.exports = router;