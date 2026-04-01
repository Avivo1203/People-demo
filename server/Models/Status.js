const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    content: { type: String, required: true },
    user: { type: String, required: true },
    // הוספת שדות מיקום
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Status', StatusSchema);