const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // מאשר גישה מכל מקום
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})); 

app.use(express.json());

// ייבוא ה-Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// נתיב בדיקה לשרת
app.get('/', (req, res) => {
  res.send('The Engine is Running!');
});

// --- הגשת ה-Frontend ב-Production ---
// הקוד הזה יופעל רק ב-Render לאחר שה-Build יסתיים
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// הגדרת הפורט
const PORT = process.env.PORT || 5000;

// חיבור ל-MongoDB והרצת השרת
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