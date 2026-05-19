const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // טוען את המשתנים מקובץ ה-.env לתוך התוכנית

const app = express();

// Middlewares
app.use(cors()); // מאפשר לפרונטאנד (פורט 5173) לדבר עם השרת (פורט 5000)
app.use(express.json()); // מאפשר לשרת לקרוא מידע שמגיע בפורמט JSON (כמו ה-username והסיסמה שישלחו אלינו)

// חיבור לבסיס הנתונים MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected successfully to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ייבוא ה-Routes של האימות
const authRoutes = require('./routes/authRoutes');

// קישור ה-Routes לכתובת בסיס קבועה
app.use('/api/auth', authRoutes);

// נתיב בדיקה בסיסי כדי לראות שהשרת חי ומגיב
app.get('/', (req, res) => {
  res.send('The Engine is Running!');
});

// הפעלת השרת על הפורט שהגדרנו
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});