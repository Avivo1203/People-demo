const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // הוספנו את path כדי לנהל נתיבים
require('dotenv').config();

const app = express();

// Middlewares
// הסרנו את ההגבלה ל-localhost כדי שהשרת יעבוד מכל מקום ב-Deploy
app.use(cors()); 

app.use(express.json());

// ייבוא ה-Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// --- הוספת ההגשה של ה-Frontend ---
// וודא שהתיקייה עם ה-build שלך נקראת 'dist' (זה הדיפולט של Vite)
app.use(express.static(path.join(__dirname, '../dist')));

// כל נתיב שלא מתחיל ב-/api יפנה ל-index.html של ה-React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// הגדרת הפורט
const PORT = process.env.PORT || 5000;

// חיבור לבסיס הנתונים והרצת השרת
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });