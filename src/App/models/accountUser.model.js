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
        default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pinterest.com%2Fvaleriy32fsm%2Fuser%2F&psig=AOvVaw0HQ7d2MmjsvtUaCxUomcY1&ust=1729326680723000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNjWy4vCl4kDFQAAAAAdAAAAABAE"
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