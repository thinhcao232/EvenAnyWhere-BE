const Notification = require('../models/notification.model');
const AccountUser = require('../models/accountUser.model');

// Tạo thông báo
exports.createNotification = async(req, res) => {
    try {
        const { title, message, userMail } = req.body;
        let emails = [];
        if (userMail && Array.isArray(userMail) && userMail.length > 0) {
            const users = await AccountUser.find({ email: { $in: userMail } }).select('email');
            emails = users.map(user => user.email);
        }
        const notification = new Notification({
            title,
            message,
            userMail: emails.length > 0 ? emails : null, // Nếu không có email, gửi cho tất cả
        });

        await notification.save();
        const notifications = await Notification.find()
            .sort({ createdAt: -1 });

        res.status(201).json({
            message: 'Notification created successfully',
            notification: notifications[0],
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating notification',
            error,
        });
    }
};
exports.getUserNotifications = async(req, res) => {
    try {
        const userId = req.user._id;
        const user = await AccountUser.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        const userMail = user.email;
        const notifications = await Notification.find({
            $or: [
                { userMail: null },
                { userMail: userMail }
            ]
        }).sort({ createdAt: -1 });

        console.log("Thông báo tìm được:", notifications);
        if (notifications.length === 0) {
            return res.status(404).json({
                message: 'No notifications found for this user.',
            });
        }
        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
        res.status(500).json({
            message: 'Error fetching notifications',
            error: error.message || error,
        });
    }
};
// Xóa một thông báo dựa vào id notification
exports.deleteNotification = async(req, res) => {
    try {
        const notificationId = req.params.id;

        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).json({
                message: 'Notification not found',
            });
        }
        res.status(200).json({
            message: 'Notification deleted successfully',
            deletedNotification,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting notification',
            error,
        });
    }
};