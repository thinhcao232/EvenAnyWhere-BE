const { generateRefreshToken, generateAccessToken } = require("../../utils/generationToken");
const isEmail = require("../../utils/isEmail");
const checkPassword = require("../../utils/checkPassword");
const AccountModal = require("../models/accountUser.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const upload = require('../../utils/uploadImageAVT');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const passport = require('../../configs/passport');
const axios = require("axios");
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
                    title: "Lỗi",
                    message: "Email hoặc mật khẩu không đúng",
                });
            }
            if (user.activeBlock) {
                return res.status(403).json({
                    title: "Lỗi Không Thể Đăng Nhập ",
                    message: "Tài khoản của bạn đã bị khóa"
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
                from: {
                    name: "EventAnyWhere",
                    address: process.env.EMAIL_USER
                }, // email gửi
                to: user.email,
                subject: 'Mật khẩu mới cho tài khoản của bạn trong ứng dụng EventAnywhere',
                html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        /* Reset styles for email clients */
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .email-header {
            background-color: #4F46E5;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }
        
        .email-body {
            padding: 30px 20px;
            color: #333333;
        }
        
        .password-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .password-text {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
            letter-spacing: 2px;
            margin: 0;
        }
        
        .warning-text {
            color: #dc3545;
            font-size: 14px;
            margin-top: 20px;
        }
        
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666666;
        }
        
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        
        /* Responsive design */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100%;
                margin: 0;
                border-radius: 0;
            }
            
            .email-header {
                padding: 20px 15px;
            }
            
            .email-body {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>EventAnyWhere 📧</h1>
        </div>
        
        <div class="email-body">
            <p>Xin chào ${user.name},</p>
            
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại ứng dụng EventAnywhere.</p>
            
            <p>Đây là mật khẩu mới của bạn:</p>
            
            <div class="password-box">
                <p class="password-text">${newPassword}</p>
            </div>
            
            <p><strong>Vì lý do bảo mật:</strong> Chúng tôi khuyên bạn nên đăng nhập vào tài khoản của mình và thay đổi mật khẩu này ngay sau khi nhận được email này.</p>         
            <p class="warning-text">⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi ngay lập tức để đảm bảo tài khoản của bạn an toàn.</p>
        </div>
        
        <div class="email-footer">
            <p>Cảm ơn bạn đã tin tưởng và sử dụng EventAnywhere.</p>
            <p>Trân trọng,<br>Đội ngũ hỗ trợ EventAnywhere</p>
        </div>
    </div>
</body>
</html>`,
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
            upload.single('image')(req, res, async(err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error uploading file' });
                }

                const { name, phone, description, address, hobbies } = req.body;
                const { _id: userId } = req.user;

                let image;
                if (req.file) {
                    image = `${req.protocol}://${req.get("host")}/public/images/${req.file.filename}`;
                }

                const updatedUserData = {
                    name,
                    phone,
                    description,
                    address,
                    hobbies,
                };
                if (image) updatedUserData.image = image;
                await AccountModal.findByIdAndUpdate(userId, updatedUserData);

                const user = await AccountModal.findById(userId).select("name image phone  description address hobbies _id");

                res.status(200).json({...user._doc });
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getUser(req, res) {
        try {
            const userId = req.user._id;

            const user = await AccountModal.findById(userId).select("-password");

            if (!user) {
                return res.status(404).json({ title: "Lỗi", message: "Người dùng không tồn tại" });
            }

            if (user.image && !user.image.startsWith("http")) {
                const host = process.env.NODE_ENV === "development" ? "10.0.2.2:3000" : req.get("host");
                user.image = `${req.protocol}://${host}/public/images/${user.image}`;
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error("Error fetching user data:", error);
            return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình lấy thông tin người dùng" });
        }
    }


    async becomeOrganizer(req, res) {
        const userId = req.user._id;
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
    async googleLogin(req, res) {
        const { idToken, platform } = req.body;

        // Kiểm tra token đầu vào
        if (!idToken) {
            return res.status(400).json({
                title: "Lỗi",
                message: "idToken là bắt buộc",
            });
        }

        try {
            // Xác thực token với Google
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                // audience: process.env.GOOGLE_CLIENT_ID, // Đảm bảo khớp với Client ID trong Google Cloud Console
            });
            const payload = ticket.getPayload();

            // Lấy thông tin người dùng từ payload
            const user = {
                googleId: payload["sub"],
                email: payload["email"],
                name: payload["name"],
                image: payload["picture"],
            };

            // Tìm hoặc tạo người dùng trong cơ sở dữ liệu
            let existingUser = await AccountModal.findOne({ googleId: user.googleId });
            if (!existingUser) {
                existingUser = await AccountModal.create(user);
            }

            // Tạo token truy cập và làm mới
            const refreshToken = generateRefreshToken(existingUser._id);
            const accessToken = generateAccessToken(existingUser._id);

            // Gửi response với các token và thông tin người dùng
            return res.status(200).json({
                message: `Đăng nhập Google thành công từ ${platform || "unknown platform"}`,
                user: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    image: existingUser.image,
                },
                tokenAccess: accessToken,
                tokenRefresh: refreshToken,
            });
        } catch (error) {
            console.error("Google Login Error:", error.message);
            return res.status(401).json({
                title: "Lỗi",
                message: "Token Google không hợp lệ",
                error: error.message,
            });
        }
    }
}

module.exports = new Account();