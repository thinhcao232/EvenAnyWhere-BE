const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/eventAnywhere");
        console.log("connect database success");
    } catch (error) {
        console.log("connect database fail: ", error.message);
    }
}

module.exports = connectDB;