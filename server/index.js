import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// טעינת משתני סביבה מקובץ ה-env
dotenv.config({ path: './.env.local' });

const app = express();

// הגדרת CORS כדי לאפשר ל-Vite (פורט 5173) לדבר עם השרת (פורט 3001)
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// שליפת כל המשתמשים (בדיקה או טעינה ראשונית)
app.get('/api/user/location', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('people+');
    const users = database.collection('users');
    
    const allUsers = await users.find().toArray();
    res.json({ allUsers });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});





// פונקציה מרכזית לעדכון מיקום, סטטוס ושליפת נתונים
app.patch('/api/user/location', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('people+');
    const users = database.collection('users');
    
    const { nickname, lat, lng, text, type, emoji } = req.body;
    
    if (!nickname) {
      return res.status(400).json({ error: "Nickname is required" });
    }

    // הכנת אובייקט העדכון
    const updateData = {
      location: { 
        type: 'Point', 
        coordinates: [lng, lat] // MongoDB מצפה קודם ל-Longitude ואז Latitude
      },
      lastSeen: new Date()
    };

    // אם נשלח סטטוס (טקסט), נעדכן גם אותו
    if (text) {
      updateData.text = text;
      updateData.type = type || 'general';
      updateData.emoji = emoji || '📍';
      updateData.timestamp = new Date();
    }
    
    // עדכון המשתמש (יצירה אם לא קיים - upsert)
    await users.updateOne(
      { nickname },
      { $set: updateData },
      { upsert: true }
    );
    
    // שליפת כל המשתמשים המעודכנים למפה
    const allUsers = await users.find().toArray();
    
    res.json({ allUsers });
  } catch (e) {
    console.error("❌ Database Error:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});