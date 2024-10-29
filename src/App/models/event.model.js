const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    organizer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'accountusers'
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    maxAttendees: {
        type: Number
    },
    price: {
        type: mongoose.Types.Decimal128
    },
    totalSessions: {
        type: Number
    },
    image: {
        type: String
    },
    hasLiveStream: {
        type: Boolean,
        default: false
    },
    category_id: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);