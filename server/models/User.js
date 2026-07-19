const mongoose = require("mongoose");

// הגדרת הסכמה - המבנה של המשתמש בבסיס הנתונים
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
  },

  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },

  password: {
    type: String,
    required: true,
  },

  // טוקן מוצפן לאיפוס סיסמה
  resetPasswordToken: {
    type: String,
    default: null,
  },

  // תאריך תפוגת קישור איפוס הסיסמה
  resetPasswordExpires: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ייצוא המודל כדי שנוכל להשתמש בו בקבצים אחרים
module.exports = mongoose.model("User", UserSchema);