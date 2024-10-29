const mongoose = require('mongoose');

const eventParticipationSchema = new mongoose.Schema({
    account_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accountusers',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        required: true,
    },
    hasJoin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('EventParticipation', eventParticipationSchema);