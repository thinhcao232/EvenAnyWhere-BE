const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        require: true
    },
    birthday: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Nam", "Nữ"],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Người tham gia sự kiện", "Nhà tổ chức sự kiện"],
        default: "Người tham gia sự kiện"
    }
})


module.exports = mongoose.model("accountUser", acountSchema)