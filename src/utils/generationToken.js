const jwt = require("jsonwebtoken");

const generateAccessToken = (_id) => {
    const token = jwt.sign({ _id }, process.env.ACCESS_TOKEN, { expiresIn: 60 });
    return token; // 60s
};

const generateRefreshToken = (_id) => {
    return jwt.sign({ _id }, process.env.REFRESH_TOKEN, { expiresIn: "30d" });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};