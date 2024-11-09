const mongoose = require('mongoose');

const sessionSpeakerSchema = new mongoose.Schema({
    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
    },
    email: {
        type: String,
        ref: 'accountUser',
        required: true,
    },
    endTime: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('SessionSpeaker', sessionSpeakerSchema);