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
app.use('/api/auth', authRoutes);

// הגשת ה-Frontend
app.use(express.static(path.join(__dirname, 'dist')));

// במקום להשתמש ב-* שגורם לקריסה, נשתמש בנתיב מפורש או נשלח את האינדקס
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// אם הנתיב לא מתחיל ב-api, נגיש את ה-index.html
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
  .catch((err) => process.exit(1));