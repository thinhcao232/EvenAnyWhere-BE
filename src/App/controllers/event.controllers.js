const Event = require('../models/event.model');

// Tạo mới sự kiện
exports.createEvent = async(req, res) => {
    try {
        const organizer_id = req.user._id;
        // Chuyển đổi chuỗi ngày từ định dạng HH:mm:ss DD-MM-YYYY sang định dạng ISO
        const dateString = req.body.date; // Giả sử date được gửi từ frontend
        const [time, dayMonthYear] = dateString.split(' '); // Tách giờ và ngày
        const [day, month, year] = dayMonthYear.split('-'); // Tách ngày, tháng, năm
        const [hours, minutes, seconds] = time.split(':'); // Tách giờ, phút, giây

        const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

        const event = new Event({
            ...req.body,
            date,
            organizer_id
        });
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
exports.getAllEvents = async(req, res) => {
    try {
        const events = await Event.find().lean();
        res.status(200).json({
            message: 'Lấy danh sách sự kiện thành công!',
            events
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy danh sách sự kiện: ${error.message}` });
    }
};

// Lấy thông tin sự kiện theo ID
exports.getEventById = async(req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
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
exports.updateEvent = async(req, res) => {
    try {
        const { id } = req.params;

        // Chuyển đổi chuỗi ngày từ định dạng HH:mm:ss DD-MM-YYYY sang định dạng ISO
        if (req.body.date) {
            const dateString = req.body.date; // Giả sử date được gửi từ frontend
            const [time, dayMonthYear] = dateString.split(' '); // Tách giờ và ngày
            const [day, month, year] = dayMonthYear.split('-'); // Tách ngày, tháng, năm
            const [hours, minutes, seconds] = time.split(':'); // Tách giờ, phút, giây

            req.body.date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
        }

        const event = await Event.findByIdAndUpdate(id, req.body, { new: true, lean: true });
        if (event) {
            res.status(200).json({
                message: 'Cập nhật sự kiện thành công!',
                event
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sự kiện để cập nhật' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể cập nhật sự kiện: ${error.message}` });
    }
};


// Xóa sự kiện theo ID
exports.deleteEvent = async(req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (event) {
            res.status(200).json({ message: 'Xóa sự kiện thành công!' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sự kiện để xóa' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể xóa sự kiện: ${error.message}` });
    }
};

// Tìm kiếm sự kiện theo tên hoặc ký tự
exports.searchEventsByTitle = async(req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const events = await Event.find({
            title: { $regex: keyword, $options: 'i' }
        }).lean();

        res.status(200).json({
            message: 'Tìm kiếm sự kiện thành công!',
            events
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể tìm kiếm sự kiện: ${error.message}` });
    }
};