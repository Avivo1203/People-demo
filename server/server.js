const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());

// API Routes
const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);

// 1. הגשת קבצים סטטיים (JS, CSS וכו') מתוך dist
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Middleware שמעביר כל בקשה שאינה API לתוך ה-React
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`)))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });