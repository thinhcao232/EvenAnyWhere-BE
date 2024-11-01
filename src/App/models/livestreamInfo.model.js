const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    startedAt: {
        type: Date,
        required: true
    },
    endAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('LiveStream', liveStreamSchema);