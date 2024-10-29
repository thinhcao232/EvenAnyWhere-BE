const { userRoles, userGender } = require("../../utils/constant");
const { generateRefreshToken, generateAccessToken } = require("../../utils/generationToken");
const isEmail = require("../../utils/isEmail");
const checkPassword = require("../../utils/checkPassword");
const AccountModal = require("../models/accountUser.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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


    async changePassword(req, res) {
        try {
            const { _id } = req.user;
            const { password, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return res.status(403).json({
                    title: "Lỗi",
                    message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
                });
            }

            const user = await AccountModal.findById(_id);

            const isMatchPW = await bcrypt.compare(password, user.password);
            if (!isMatchPW) {
                return res.status(403).json({
                    title: "Lỗi",
                    message: "Mật khẩu cũ không đúng",
                });
            }

            const newHashPass = await bcrypt.hash(newPassword, saltRounds);

            await AccountModal.findByIdAndUpdate(_id, { password: newHashPass });

            res.status(200).json({
                title: "Thành công",
                message: "Đổi mật khẩu thành công"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email } = req.body;

            const user = await AccountModal.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    title: "Lỗi",
                    message: "Email không tồn tại trong hệ thống",
                });
            }

            const newPassword = crypto.randomBytes(4).toString('hex');


            const hashPassword = await bcrypt.hash(newPassword, saltRounds);
            await AccountModal.findByIdAndUpdate(user._id, { password: hashPassword });

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER, // email gửi
                to: user.email,
                subject: 'Mật khẩu mới cho tài khoản của bạn trong ứng dụng EventAnywhere',
                text: `Xin chào ${user.name},

Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại ứng dụng EventAnywhere. Đây là mật khẩu mới của bạn:

        Mật Khẩu Mới: ${newPassword}

Vì lý do bảo mật, chúng tôi khuyên bạn nên đăng nhập vào tài khoản của mình và thay đổi mật khẩu này ngay sau khi nhận được email này. 
Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi ngay lập tức để đảm bảo tài khoản của bạn an toàn.
Cảm ơn bạn đã tin tưởng và sử dụng EventAnywhere.

Trân trọng,
Đội ngũ hỗ trợ EventAnywhere.`,
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                title: "Thành công",
                message: "Mật khẩu mới đã được gửi vào email của bạn",
            });

        } catch (error) {
            console.error("Error resetting password:", error);
            return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình đặt lại mật khẩu" });
        }
    }

    async updateProfile(req, res) {
        try {
            const { name, image, phone, gender, description, address, hobbies } = req.body;
            const { _id: userId } = req.user;

            await AccountModal.findByIdAndUpdate(userId, {
                name,
                image,
                phone,
                gender: Number(gender), // đảm bảo rằng gender là số    0 nam 1 nữa
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

    async becomeOrganizer(req, res) {
        const userId = req.user._id; // Lấy user ID từ token đã xác thực
        try {
            const account = await AccountModal.findById(userId);
            if (!account) {
                return res.status(404).json({ title: "Lỗi", message: "Người dùng không tồn tại" });
            }
            if (account.role === 'organizer') {
                return res.status(400).json({ title: "Lỗi", message: "Bạn đã là tổ chức viên" });
            }
            account.role = 'organizer';
            await account.save();

            return res.status(200).json({
                title: "Thành công",
                message: "Become organizer",
                account
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ title: "Lỗi", message: "Có lỗi xảy ra khi cập nhật vai trò" });
        }
    }

    async joinEvent(req, res) {
        try {
            const { id: eventId } = req.params; // Event ID from URL parameter
            const userId = req.user._id; // User ID from authenticated user

            // Find the user and check if they have already joined the event
            const user = await AccountModal.findById(userId);
            if (!user) {
                return res.status(404).json({ title: "Lỗi", message: "Người dùng không tồn tại" });
            }

            // Check if the event is already in the joinedEvents array
            if (user.joinedEvents && user.joinedEvents.includes(eventId)) {
                return res.status(400).json({ title: "Lỗi", message: "Bạn đã tham gia sự kiện này" });
            }

            // Add the event ID to the joinedEvents array
            user.joinedEvents = [...user.joinedEvents, eventId];
            await user.save();

            return res.status(200).json({
                title: "Thành công",
                message: "Tham gia sự kiện thành công",
                joinedEvents: user.joinedEvents
            });
        } catch (error) {
            console.error("Error joining event:", error);
            return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình tham gia sự kiện" });
        }
    }


}

module.exports = new Account();