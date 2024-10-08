const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
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
        enum: ["Người tham gia sự kiện", "Nhà tổ chức sự kiện"],
        default: "Người tham gia sự kiện"
    }
})
module.exports = mongoose.model("accountUser", accountSchema)