const { generateRefreshToken, generateAccessToken } = require("../../utils/generationToken");
const isEmail = require("../../utils/isEmail");
const checkPassword = require("../../utils/checkPassword");
const AdminModel = require("../models/admin.model");
//const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { compare } = require("bcrypt");
const adminModel = require("../models/admin.model");

//const saltRounds = 10;

class AdminController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!isEmail(email)) {
                return res.status(400).json({ title: "Lỗi cú pháp", message: "Email không hợp lệ" });
            }
            if (!checkPassword(password)) {
                return res.status(400).json({ title: "Lỗi cú pháp", message: "Mật khẩu không hợp lệ" });
            }

            const existingAdmin = await AdminModel.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ title: "Lỗi cú pháp", message: "Email đã tồn tại" });
            }

            // const hashedPassword = await bcrypt.hash(password, saltRounds);
            //const newAdmin = await AdminModel.create({ name, email, password: hashedPassword });
            const newAdmin = await AdminModel.create({ name, email, password });

            const refreshToken = generateRefreshToken(newAdmin._id);
            const accessToken = generateAccessToken(newAdmin._id);

            await AdminModel.findByIdAndUpdate(newAdmin._id, { token: [refreshToken] });

            res.cookie("refresh-token", refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "strict",
                expires: new Date(Date.now() + 30 * 24 * 3600000), // 30 days
            });

            const { _id } = newAdmin;
            return res.status(201).json({
                admin: { _id, name, email },
                token: accessToken
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const admin = await AdminModel.findOne({ email });
            // if (!admin || !(await bcrypt.compare(password, admin.password))) {
            //     return res.status(400).json({ title: "Lỗi", message: "Email hoặc mật khẩu không đúng" });
            // }
            if (!admin || !password) {
                return res.status(400).json({ title: "Lỗi", message: "Email hoặc mật khẩu không đúng" });
            }

            const refreshToken = generateRefreshToken(admin._id);
            const accessToken = generateAccessToken(admin._id);

            await AdminModel.findByIdAndUpdate(admin._id, { token: [...admin.token, refreshToken] });

            res.cookie("refresh-token", refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "strict",
                expires: new Date(Date.now() + 30 * 24 * 3600000), // 30 days
            });

            const { _id, name } = admin;
            return res.status(200).json({
                message: "Đăng Nhập Thành Công",
                admin: { _id, name, email },
                tokenAccess: accessToken,
                tokenRefresh: refreshToken,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies["refresh-token"];
            const { id } = req.params;
            if (!refreshToken) {
                return res.status(401).json({
                    title: "Lỗi",
                    message: "Lỗi xác thực 1 (Không có refresh token)",
                });
            }
            const user = await AccountModal.findById(id);
            if (!user.token.includes(refreshToken)) {
                return res.status(401).json({
                    title: "Lỗi",
                    message: "Lỗi xác thực 2 (Refresh token không hợp lệ)",
                });
            }

            const newTokens = user.token.filter((token) => token !== refreshToken);

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async(err, decodedUser) => {
                if (err) {
                    return res.status(401).json({
                        title: "Lỗi",
                        message: "Lỗi xác thực 3 (Refresh token không hợp lệ hoặc đã hết hạn)",
                    });
                }
                const newRefreshToken = generateRefreshToken(decodedUser._id);
                const accessToken = generateAccessToken(decodedUser._id);
                r
                newTokens.push(newRefreshToken);

                res.cookie("refresh-token", newRefreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 ngày
                    httpOnly: true,
                    secure: true,
                });
                await AccountModal.findByIdAndUpdate(id, { token: newTokens });

                res.status(200).json({ token: accessToken });
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getAdminInfo(req, res) {
        try {
            const { _id } = req.user;
            const admin = await AdminModel.findById(_id).select("name email password phone image createdAt updatedAt");
            if (!admin) {
                return res.status(404).json({ title: "Lỗi", message: "Không tìm thấy thông tin admin" });
            }
            return res.status(200).json(admin);
        } catch (error) {
            console.error("Error fetching admin info:", error);
            res.status(500).json({ message: error.message });
        }
    }
    async updateAdmin(req, res) {
        try {
            const { name, email, password, image, phone } = req.body;
            const { _id: userId } = req.user;

            await adminModel.findByIdAndUpdate(userId, {
                name,
                email,
                password,
                image,
                phone,
            });

            const user = await adminModel.findById(userId).select("_id name email password image phone ");


            res.status(200).json({...user._doc });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new AdminController();