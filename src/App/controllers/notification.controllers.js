const Notification = require('../models/notification.model');

exports.createNotification = async(req, res) => {
    try {
        const { title, message, userMail } = req.body;
        const notification = new Notification({
            title,
            message,
            userMail: userMail || null // Nếu không có userMail, sẽ là thông báo cho tất cả
        });

        await notification.save();
        res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
};

// Lấy thông báo của một người dùng (dựa vào email)
exports.getUserNotifications = async(req, res) => {
    try {
        const userMail = req.params.email;

        const notifications = await Notification.find({
            $or: [
                { userMail: null }, // Thông báo gửi cho tất cả
                { userMail: userMail } // Thông báo dành riêng cho người dùng này
            ]
        });

        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};