const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// יצירת חיבור לשירות המייל
const createMailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

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
    res.status(500).json({
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
    res.status(500).json({
      message: "שגיאת שרת פנימית",
    });
  }
};

// שליחת קישור לאיפוס סיסמה
const forgotPassword = async (req, res) => {
  try {
    const cleanEmail = req.body.email?.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        message: "נא להזין כתובת אימייל",
      });
    }

    const user = await User.findOne({
      email: cleanEmail,
    });

    const successMessage =
      "אם כתובת האימייל קיימת במערכת, נשלח אליה קישור לאיפוס הסיסמה.";

    if (!user) {
      return res.status(200).json({
        message: successMessage,
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const clientUrl =
      process.env.CLIENT_URL || "https://people-demo.onrender.com";

    const resetUrl = `${clientUrl}/?resetToken=${resetToken}`;

    const transporter = createMailTransporter();

    await transporter.sendMail({
      from: `"People+" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "איפוס סיסמה לחשבון People+",
      html: `
        <div
          dir="rtl"
          style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 0 auto;
            padding: 32px;
            color: #10203a;
          "
        >
          <h1 style="color: #0d7ee2; margin-bottom: 24px;">
            People+
          </h1>

          <h2>איפוס סיסמה</h2>

          <p>
            התקבלה בקשה לאיפוס הסיסמה של החשבון שלך.
          </p>

          <p>
            הקישור יהיה תקף למשך 15 דקות ולשימוש חד־פעמי בלבד.
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              margin: 18px 0;
              padding: 14px 24px;
              border-radius: 12px;
              background: #0d7ee2;
              color: #ffffff;
              text-decoration: none;
              font-weight: bold;
            "
          >
            בחירת סיסמה חדשה
          </a>

          <p style="font-size: 14px; color: #667085;">
            אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהודעה זו.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      message: successMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "לא ניתן לשלוח כרגע את קישור האיפוס",
    });
  }
};

// עדכון הסיסמה באמצעות קישור האיפוס
const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: "נא למלא את כל השדות",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message: "הסיסמה חייבת להיות באורך של 4 תווים לפחות",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "הסיסמאות אינן תואמות",
      });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "קישור האיפוס אינו תקין או שפג תוקפו",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message: "הסיסמה עודכנה בהצלחה",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "שגיאה בעדכון הסיסמה",
    });
  }
};

// קבלת פרטי המשתמש הנוכחי
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "המשתמש לא נמצא",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Me error:", error);

    res.status(500).json({
      message: "שגיאת שרת פנימית",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};