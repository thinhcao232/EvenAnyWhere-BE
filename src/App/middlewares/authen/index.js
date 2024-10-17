const jwt = require("jsonwebtoken");

function authen(req, res, next) {
    try {
        const token = req.headers["authorization"];
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ title: "Lỗi", message: "Token không hợp lệ" });
        }

        const jwtToken = token.split(" ")[1];

        if (!process.env.ACCESS_TOKEN) {
            return res.status(500).json({ title: "Lỗi", message: "Không tìm thấy secret key để xác thực" });
        }

        jwt.verify(jwtToken, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                console.error("JWT Verify Error:", err);
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ title: "Lỗi", message: "Token đã hết hạn" });
                }
                return res.status(401).json({ title: "Lỗi", message: "Token không hợp lệ" });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = authen;