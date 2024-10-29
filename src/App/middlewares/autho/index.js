const Account = require("../../models/accountUser.model");

async function checkRole(_id) {
    const account = await Account.findById(_id);
    return account.role;
}
async function organizerRole(req, res, next) {
    const role = await checkRole(req.user._id);
    if (role === "organizer") {
        req.role = role;
        return next();
    }
    return res.status(401).json({
        title: "không đủ quyền",
        message: "Bạn không không phải là organizer",
    });
}

module.exports = organizerRole;