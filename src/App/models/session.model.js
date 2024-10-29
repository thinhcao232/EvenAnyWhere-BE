const mongoose = require('mongoose');
//const Schema = mongoose.Schema;

const sessionSchema = mongoose.Schema({
    event_id: {
        type: String,
        ref: 'events',
        required: true
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
        type: String
    },
    isLiveStream: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Session', sessionSchema);