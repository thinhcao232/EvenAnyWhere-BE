const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.UUID,
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
        type: mongoose.Schema.Types.UUID
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


eventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', eventSchema);