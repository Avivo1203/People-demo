const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ייבוא חבילת ה-CORS
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// --- MIDDLEWARE (חובה בסדר הזה!) ---
app.use(cors()); // מאפשר ל-React לדבר עם השרת
app.use(express.json()); // מאפשר לשרת לקרוא נתוני JSON מה-Body

// --- חיבור ל-MONGODB ---
// וודא שהשם הוא people+ כפי שמופיע אצלך ב-Atlas
const mongoURI = "mongodb+srv://moranamar1997:Moran@cluster0.95bbbie.mongodb.net/people+?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected to people+"))
    .catch(err => console.log("❌ Connection Error:", err));

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/statusses', require('./routes/statusses'));

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));