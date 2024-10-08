const AccountUser = require("../models/accountUser.model");
const bcrypt = require("bcrypt");


const saltRounds = 10;
exports.register = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await AccountUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email Already Used." });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new AccountUser({
            name,
            email,
            password: hashedPassword
        });

        // Lưu vào cơ sở dữ liệu
        await newUser.save();

        res.status(201).json({ message: "Registration Successful." });
    } catch (error) {
        res.status(500).json({ message: "Server Error.", error });
    }
};

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await AccountUser.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email Does Not Exist." });
        }
        // So sánh mật khẩu đã nhập với mật khẩu đã mã hóa
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password, Please Try Again !" });
        }

        res.status(200).json({ message: "Login Successful." });
    } catch (error) {
        res.status(500).json({ message: "Server Error.", error });
    }
};