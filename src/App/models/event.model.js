const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
<<<<<<< HEAD
    title: {
        type: String,
        required: true
    },
    organizer_id: {
=======
    id: {
        type: mongoose.Schema.Types.UUID,
        default: () => new mongoose.Types.UUID(),
        primaryKey: true, // Thay đổi nếu cần thiết
        unique: true
    },
    title: {
>>>>>>> 2a6a66530e1b559e2509861eab8f68b410d4c470
        type: String,
        required: true
    },
    description: {
        type: String
    },
<<<<<<< HEAD
    keywords: {
        type: Map,
        of: String
    },
=======
>>>>>>> 2a6a66530e1b559e2509861eab8f68b410d4c470
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
<<<<<<< HEAD
    banner: {
        type: String
=======
    hasLiveStream: {
        type: Boolean,
        default: false
>>>>>>> 2a6a66530e1b559e2509861eab8f68b410d4c470
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

<<<<<<< HEAD
module.exports = mongoose.model('Event', eventSchema);
=======

eventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', eventSchema);
>>>>>>> 2a6a66530e1b559e2509861eab8f68b410d4c470
