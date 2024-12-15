    const mongoose = require('mongoose');

    const Notification = mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        userMail: {
            type: [String]
        },
    }, { timestamps: true });

    module.exports = mongoose.model("Notification", Notification)