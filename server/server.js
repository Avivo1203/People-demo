const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // טוען את המשתנים מקובץ ה-.env לתוך התוכנית

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // מאשר לפרונטאנד שלכם לדבר עם השרת
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})); 

app.use(express.json()); // מאפשר לשרת לקרוא מידע שמגיע בפורמט JSON

// ייבוא ה-Routes של האימות
const authRoutes = require('./routes/authRoutes');

// קישור ה-Routes לכתובת בסיס קבועה
app.use('/api/auth', authRoutes);

// נתיב בדיקה בסיסי כדי לראות שהשרת חי ומגיב
app.get('/', (req, res) => {
  res.send('The Engine is Running!');
});

// הגדרת הפורט
const PORT = process.env.PORT || 5000;

// חיבור לבסיס הנתונים MongoDB - הפעלת השרת תתבצע רק לאחר חיבור מוצלח!
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB');
    
    // רק כשהחיבור למונגו הצליח, השרת מתחיל להקשיב לבקשות
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // סגירת התהליך אם אין חיבור לדאטהבייס
  });