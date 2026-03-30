import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  fullName: String,
  bio: String,
  location: {
    type: { 
      type: String, 
      enum: ['Point'], // מוודא שזה תמיד יהיה 'Point'
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: true 
    }
  },
  lastSeen: { type: Date, default: Date.now }
});

// הגדרת האינדקס בצורה גלובלית למודל
UserSchema.index({ location: "2dsphere" });

export default mongoose.models.User || mongoose.model('User', UserSchema);