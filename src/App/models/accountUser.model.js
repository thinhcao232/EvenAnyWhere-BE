const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["attendee", "organizer", "admin"],
        default: "attendee"
    },
    token: [{
        type: String
    }]
}, { timestamps: true });


module.exports = mongoose.model("accountUser", accountSchema)