    const mongoose = require('mongoose');

    const Notification = mongoose.Schema({
        tille: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        userMail: {
            type: String
        }

    }, { timestamps: true });

    module.exports = mongoose.model("Notification", Notification)