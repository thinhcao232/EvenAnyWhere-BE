const accountUserModel = require("../App/models/accountUser.model")

module.exports = {
    register: async(req, res) => {
        const body = req.body;
        const newAccount = await accountUserModel.create(body);
        return res.status(201).json(newAccount);
    },
    login: async(req, res) => {
        const body = req.body; // {useremail: "abc@gmail.com", password: "123"}
        const account = await accountUserModel.findOne(body);
        if (!account) {
            return res.status(400).json({
                statusCode: 400,
                message: "Tài khoản hoặc mật khẩu không đúng"
            })
        }
        return res.status(200).json(account);
    }
}