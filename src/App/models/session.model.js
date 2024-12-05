const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);