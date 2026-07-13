const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// לוגיקת הרשמה (Register)
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // ניקוי רווחים מיותרים
    const cleanFirstName = firstName?.trim();
    const cleanLastName = lastName?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phone?.trim();

    // 1. בדיקה בסיסית של שדות חובה
    if (!cleanFirstName || !cleanLastName || !password) {
      return res.status(400).json({
        message: "נא למלא שם פרטי, שם משפחה וסיסמה",
      });
    }

    // 2. חובה לפחות אימייל או טלפון
    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({
        message: "נא למלא לפחות אימייל או מספר טלפון",
      });
    }

    // 3. בדיקת אורך סיסמה
    if (password.length < 4) {
      return res.status(400).json({
        message: "הסיסמה חייבת להיות באורך של 4 תווים לפחות",
      });
    }

    // 4. בדיקה אם אימייל או טלפון כבר קיימים
    const userExists = await User.findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
      ],
    });

    if (userExists) {
      return res.status(400).json({
        message: "משתמש עם אימייל או טלפון כזה כבר קיים במערכת",
      });
    }

    // 5. יצירת username פנימי לפי שם פרטי + שם משפחה
    const username = `${cleanFirstName} ${cleanLastName}`;

    // 6. הצפנת הסיסמה
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. יצירת משתמש חדש
    const newUser = new User({
      username,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      password: hashedPassword,
    });

    // 8. שמירה בבסיס הנתונים
    await newUser.save();

    // 9. יצירת Token גם אחרי הרשמה
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 10. החזרת תשובת הצלחה
    res.status(201).json({
      message: "המשתמש נרשם בהצלחה!",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// לוגיקת התחברות (Login)
const login = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    const cleanLoginIdentifier = loginIdentifier?.trim().toLowerCase();

    // 1. בדיקה שכל השדות הגיעו
    if (!cleanLoginIdentifier || !password) {
      return res.status(400).json({
        message: "נא למלא אימייל או מספר טלפון וסיסמה",
      });
    }

    // 2. חיפוש המשתמש לפי אימייל או טלפון
    const user = await User.findOne({
      $or: [
        { email: cleanLoginIdentifier },
        { phone: cleanLoginIdentifier },
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: "פרטי ההתחברות אינם נכונים",
      });
    }
     
    // 3. השוואת הסיסמה שהוקלדה עם הסיסמה המוצפנת ב-DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "פרטי ההתחברות אינם נכונים",
      });
    }

    // 4. יצירת JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 5. החזרת תשובת הצלחה
    res.status(200).json({
      message: "התחברת בהצלחה!",
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// קבלת פרטי המשתמש הנוכחי (Get Me)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "המשתמש לא נמצא" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Me error:", error);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

module.exports = {
  register,
  login,
  getMe,
};