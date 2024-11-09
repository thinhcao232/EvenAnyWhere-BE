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
    maxAttendees: {
        type: Number
    },
    location: {
        type: String,
        required: true
    },
    isLiveStream: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);