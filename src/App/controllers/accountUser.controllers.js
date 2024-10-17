const { userRoles, userGender } = require("../../utils/constant");
const { generateRefreshToken, generateAccessToken } = require("../../utils/generationToken");
const isEmail = require("../../utils/isEmail");
const checkPassword = require("../../utils/checkPassword");
const AccountModal = require("../models/accountUser.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

class Account {
    async register(req, res) {
        try {
            const {
                name: namePayload,
                email: emailPayload,
                password: passwordPayload,
            } = req.body;

            if (!isEmail(emailPayload))
                return res.status(403).json({
                    title: "Lỗi cú pháp",
                    message: "Email không hợp lệ",
                });
            if (!checkPassword(passwordPayload))
                return res.status(403).json({
                    title: "Lỗi cú pháp",
                    message: "Mật khẩu không hợp lệ",
                });

            const hasExistEmail = await AccountModal.exists({ email: emailPayload });

            if (hasExistEmail)
                return res.status(403).json({
                    title: "Lỗi cú pháp",
                    message: "Email đã tồn tại",
                });

            const hashPassword = await bcrypt.hash(passwordPayload, saltRounds);
            let newUser = await AccountModal.create({
                name: namePayload,
                email: emailPayload,
                password: hashPassword,
            });
            //   await AccountModal.findByIdAndUpdate(newUser._id, { username: "user" + newUser._id });

            const refreshToken = generateRefreshToken(newUser._id);
            const accessToken = generateAccessToken(newUser._id);

            newUser = await AccountModal.findByIdAndUpdate(newUser._id, {
                token: [refreshToken],
            });

            res.cookie("refresh-token", refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "strict",
                expires: new Date(Date.now() + 30 * 24 * 3600000), // 30 days
            });
            const { name, email, role, _id } = newUser;

            return res.status(200).json({
                user: { _id, name, email, role },
                token: accessToken,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email: emailPayload, password } = req.body;

            if (!checkPassword(password))
                return res.status(403).json({
                    title: "Lỗi cú pháp",
                    message: "Mật khẩu không hợp lệ",
                });
            let user = await AccountModal.findOne({ email: emailPayload });
            if (!user) {
                return res.status(403).json({
                    title: "Lỗi ",
                    message: "Email hoặc mật khẩu không đúng",
                });
            }

            const isMatchPW = await bcrypt.compare(password, user.password);
            if (!isMatchPW) {
                return res.status(403).json({
                    title: "Lỗi ",
                    message: "Email hoặc mật khẩu không đúng",
                });
            }

            // create tokens
            const refreshToken = generateRefreshToken(user._id);
            const accessToken = generateAccessToken(user._id);

            user = await AccountModal.findByIdAndUpdate(user._id, {
                token: [...user.token, refreshToken],
            });

            res.cookie("refresh-token", refreshToken, {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "strict",
                expires: new Date(Date.now() + 30 * 24 * 3600000), // 30 days
            });

            const { image, name, email, role, _id, phone, gender, description, address, hobbies } = user;
            return res.status(200).json({
                message: "Đăng Nhập Thành Công",
                user: {
                    image,
                    _id,
                    name,
                    email,
                    role,
                    phone,
                    gender,
                    description,
                    address,
                    hobbies
                },
                tokenAccess: accessToken,
                tokenRefresh: refreshToken

            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async logout(req, res) {
        try {
            const refreshToken = req.cookies["refresh-token"];
            if (!refreshToken) {
                return res.status(401).json({
                    title: "Lỗi",
                    message: "Lỗi xác thực 1",
                });
            }
            const { _id } = req.user;
            const user = await AccountModal.findById(_id);
            if (!user.token.includes(refreshToken)) {
                return res.status(401).json({
                    title: "Lỗi",
                    message: "Lỗi xác thực 2",
                });
            }

            const newTokens = user.token.filter((tokenItem) => tokenItem !== refreshToken);
            res.clearCookie("refresh-token");

            await AccountModal.findByIdAndUpdate(_id, { token: newTokens });

            res.status(200).json({
                message: "Đăng Xuất Thành Công"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies["refresh-token"];
            const { id } = req.params;

            // Kiểm tra nếu không có refresh token
            if (!refreshToken) {
                return res.status(401).json({
                    title: "Lỗi",
                    message: "Lỗi xác thực 1 (Không có refresh token)",
                });
            }
            const user = await AccountModal.findById(id);

            // Kiểm tra nếu refresh token không khớp với bất kỳ token nào trong database
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


    // async changePassword(req, res) {
    //     try {
    //         const { _id } = req.user;
    //         const { password, newPassword } = req.body;
    //         console.log(_id, password, newPassword);
    //         const user = await AccountModal.findById(_id);
    //         const isMatchPW = await bcrypt.compare(password, user.password);

    //         if (!isMatchPW) {
    //             return res.status(403).json({
    //                 title: "Lỗi ",
    //                 message: "Mật khẩu sai",
    //             });
    //         }

    //         const newHashPass = await bcrypt.hash(newPassword, saltRounds);

    //         await AccountModal.findByIdAndUpdate(_id, { password: newHashPass });
    //         res.status(200).json({ title: "Thành công", message: "Đổi mật khẩu thành công" });
    //     } catch (error) {
    //         res.status(500).json({ message: error.message });
    //     }
    // }

    async updateProfile(req, res) {
        try {
            const { name, image, phone, gender, description, address, hobbies } = req.body;
            const { _id: userId } = req.user;

            await AccountModal.findByIdAndUpdate(userId, {
                name,
                image,
                phone,
                gender: Number(gender), // đảm bảo rằng gender là số
                description,
                address,
                hobbies
            });

            const user = await AccountModal.findById(userId).select("name image phone gender description address hobbies role email _id");


            res.status(200).json({...user._doc });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

}

module.exports = new Account();