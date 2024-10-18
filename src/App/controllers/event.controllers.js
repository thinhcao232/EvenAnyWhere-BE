const Event = require('../models/event.model');

// Tạo mới sự kiện
exports.createEvent = async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json({
            message: 'Tạo sự kiện thành công!',
            event
        });
    } catch (error) {
        res.status(400).json({ message: `Không thể tạo sự kiện: ${error.message}` });
    }
};

// Lấy danh sách tất cả sự kiện
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json({
            message: 'Lấy danh sách sự kiện thành công!',
            events
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy danh sách sự kiện: ${error.message}` });
    }
};


// Lấy thông tin sự kiện theo ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            res.status(200).json({
                message: 'Lấy thông tin sự kiện thành công!',
                event
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy thông tin sự kiện: ${error.message}` });
    }
};

// Cập nhật sự kiện theo ID
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (event) {
            res.status(200).json({
                message: 'Cập nhật sự kiện thành công!',
                event
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể cập nhật sự kiện: ${error.message}` });
    }
};

// Xóa sự kiện theo ID
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (event) {
            res.status(200).json({ message: 'Xóa sự kiện thành công!' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể xóa sự kiện: ${error.message}` });
    }
};
