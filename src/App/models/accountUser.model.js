const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    userEmail: {
        type: string,
        required: true,
        unique: true
    },
    password: {
        type: string,
        required: true
    },
    name: {
        type: string,
        require: true
    },
    birthday: {
        type: date,
        required: true
    },
    phone: {
        type: string,
        required: true
    },
    gender: {
        type: string,
        enum: ["Nam", "Nữ"],
        required: true
    },
    address: {
        type: string,
        required: true
    },
    role: {
        type: string,
        enum: ["Người tham gia sự kiện", "Nhà tổ chức sự kiện"],
        default: "Người tham gia sự kiện"
    }
})


module.exports = mongoose.model("accountUser", acountSchema)