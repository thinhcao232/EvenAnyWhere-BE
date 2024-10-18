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
    image: {
        type: String,
        default: "https://cdn1.iconfinder.com/data/icons/user-interface-664/24/User-512.png"
    },
    gender: {
        type: Number, // 0 nam 1 nu
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    hobbies: {
        type: [String],
        default: null
    },
    role: {
        type: String,
        enum: ["attendee", "organizer", "admin"],
        default: "attendee"
    },
    activeSpeaker: {
        type: Boolean,
        default: false
    },
    speaker_start_time: {
        type: Date
    },
    speaker_end_time: {
        type: Date
    },
    token: [{
        type: String
    }]
}, { timestamps: true });


module.exports = mongoose.model("accountUser", accountSchema)