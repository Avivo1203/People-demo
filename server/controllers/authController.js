const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// לוגיקת הרשמה
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const cleanFirstName = firstName?.trim();
    const cleanLastName = lastName?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phone?.trim();

    if (!cleanFirstName || !cleanLastName || !password) {
      return res.status(400).json({
        message: "נא למלא שם פרטי, שם משפחה וסיסמה",
      });
    }

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({
        message: "נא למלא לפחות אימייל או מספר טלפון",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message: "הסיסמה חייבת להיות באורך של 4 תווים לפחות",
      });
    }

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

    const username = `${cleanFirstName} ${cleanLastName}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
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

    return res.status(500).json({
      message: "שגיאת שרת פנימית",
    });
  }
};

// לוגיקת התחברות
const login = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    const cleanLoginIdentifier = loginIdentifier?.trim().toLowerCase();

    if (!cleanLoginIdentifier || !password) {
      return res.status(400).json({
        message: "נא למלא אימייל או מספר טלפון וסיסמה",
      });
    }

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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "פרטי ההתחברות אינם נכונים",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
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

    return res.status(500).json({
      message: "שגיאת שרת פנימית",
    });
  }
};

// קבלת פרטי המשתמש הנוכחי
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "המשתמש לא נמצא",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get Me error:", error);

    return res.status(500).json({
      message: "שגיאת שרת פנימית",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};