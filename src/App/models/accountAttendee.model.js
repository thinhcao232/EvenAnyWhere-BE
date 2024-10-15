const mongoose = require('mongoose');

const attendeeSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    preferences: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },
    surveyResponses: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Attendee', attendeeSchema);
