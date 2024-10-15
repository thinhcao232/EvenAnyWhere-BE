const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    organizationName: {
        type: String,
        required: true,
        unique: true
    },
    contactInfo: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model("accountOrganizer", accountSchema)