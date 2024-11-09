const mongoose = require('mongoose');

const eventParticipationSchema = new mongoose.Schema({
    account_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accountUser',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    hasJoin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('EventParticipation', eventParticipationSchema);