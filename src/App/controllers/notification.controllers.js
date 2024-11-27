const Notification = require('../models/notification.model');
const { getIO } = require('../../configs/socket');

// Tạo thông báo
exports.createNotification = async(req, res) => {
    try {
        const { title, message, userMail } = req.body;

        // Tạo thông báo mới
        const notification = new Notification({
            title,
            message,
            userMail: userMail || null // Nếu không có userMail, thông báo gửi cho tất cả
        });

        await notification.save();

        // Gửi thông báo realtime qua WebSocket
        const io = getIO();
        io.emit('receiveNotification', {
            title,
            message,
            userMail: userMail || 'all' // Nếu null, mặc định gửi cho tất cả
        });

        res.status(201).json({
            message: 'Notification created successfully',
            notification,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating notification',
            error,
        });
    }
};

// Lấy thông báo của một người dùng (dựa vào email)
exports.getUserNotifications = async(req, res) => {
    try {
        const userMail = req.params.email;

        const notifications = await Notification.find({
            $or: [
                { userMail: null }, // Thông báo gửi cho tất cả
                { userMail: userMail }, // Thông báo dành riêng cho người dùng này
            ],
        });

        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching notifications',
            error,
        });
    }
};

// Xóa một thông báo dựa vào id
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