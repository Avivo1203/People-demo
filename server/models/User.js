const mongoose = require('mongoose');

// הגדרת הסכמה - המבנה של המשתמש בבסיס הנתונים
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,  // שדה חובה, אי אפשר להירשם בלעדיו
    unique: true,    // ייחודי! מונע מצב ששני משתמשים יירשמו עם אותו שם/אימייל
    trim: true       // מנקה רווחים מיותרים מהקצוות אוטומטית (למשל: " moran " יהפוך ל-"moran")
  },
  password: {
    type: String,
    required: true   // שדה חובה
  },
  createdAt: {
    type: Date,
    default: Date.now // אם לא נספק תאריך, מונגוס יכניס אוטומטית את זמן הרישום הנוכחי
  }
});

// ייצוא המודל כדי שנוכל להשתמש בו בקבצים אחרים (כמו ב-Register וב-Login)
module.exports = mongoose.model('User', UserSchema);