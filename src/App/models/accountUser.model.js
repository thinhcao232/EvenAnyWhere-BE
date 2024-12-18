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
        required: function () { return !this.googleId && !this.facebookId; }
    },
    googleId: {
        type: String,  
        unique: true,
        sparse: true  
    },
    image: {
        type: String,
        default: "https://cdn1.iconfinder.com/data/icons/user-interface-664/24/User-512.png"
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
        default: []
    },
    role: {
        type: String,
        enum: ["attendee", "organizer"],
        default: "attendee"
    },
    activeSpeaker: {
        type: Boolean,
        default: false
    },
    activeBlock: {
        type: Boolean,
        default: false
    },
    token: [{
        type: String
    }]
}, { timestamps: true });


module.exports = mongoose.model("accountUser", accountSchema)