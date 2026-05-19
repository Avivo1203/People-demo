const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// לוגיקת הרשמה (Register)
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. בדיקה בסיסית ששני השדות הגיעו
    if (!username || !password) {
      return res.status(400).json({ message: 'אנא מלא את כל השדות' });
    }

    // 2. בדיקה אם המשתמש כבר קיים במערכת
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'שם המשתמש כבר קיים במערכת' });
    }

    // 3. הצפנת הסיסמה (Hashing)
    // Salt הוא מחרוזת אקראית שמתווספת לסיסמה לפני ההצפנה כדי להפוך אותה למאובטחת יותר
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. יצירת משתמש חדש עם הסיסמה המוצפנת
    const newUser = new User({
      username,
      password: hashedPassword
    });

    // 5. שמירה בבסיס הנתונים
    await newUser.save();

    // החזרת תשובת הצלחה (בלי הסיסמה כמובן!)
    res.status(201).json({
      message: 'המשתמש נרשם בהצלחה בהצלחה!',
      user: {
        id: newUser._id,
        username: newUser.username
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית' });
  }
};

// לוגיקת התחברות (Login)
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. בדיקה שכל השדות הגיעו
    if (!username || !password) {
      return res.status(400).json({ message: 'אנא מלא את כל השדות' });
    }

    // 2. חיפוש המשתמש בבסיס הנתונים
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'שם משתמש או סיסמה אינם נכונים' });
    }

    // 3. השוואת הסיסמה שהוקלדה עם הסיסמה המוצפנת ב-DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'שם משתמש או סיסמה אינם נכונים' });
    }

    // 4. יצירת JWT Token
    // אנחנו מכניסים לתוך ה-Token את ה-ID של המשתמש (Payload) וחותמים אותו עם המפתח הסודי מה-.env
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // ה-Token יהיה בתוקף ל-30 ימים (נוח לפיתוח)
    );

    // 5. החזרת תשובת הצלחה עם ה-Token והמשתמש
    res.status(200).json({
      message: 'התחברת בהצלחה!',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית' });
  }
};

// קבלת פרטי המשתמש הנוכחי (Get Me)
const getMe = async (req, res) => {
  try {
    // req.userId מגיע מוכן מה-Middleware שכתבנו הרגע!
    // השתמשנו ב-.select('-password') כדי לשלוף את המשתמש *בלי* הסיסמה שלו, ליתר ביטחון
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'המשתמש לא נמצא' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get Me error:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית' });
  }
};

// מייצאים את הפונקציה כדי שה-Route יוכל להשתמש בה
module.exports = {
  register,
  login,
  getMe
};