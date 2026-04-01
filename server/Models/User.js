const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // מבטיח שלא יהיו שני משתמשים עם אותו מייל
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // מינימום אבטחה בסיסית
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);