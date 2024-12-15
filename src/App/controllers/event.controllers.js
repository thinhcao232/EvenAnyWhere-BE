const Event = require('../models/event.model');
const uploadEventImages = require('../../utils/uploadEventImages');
// Tạo mới sự kiện

exports.createEvent = async(req, res) => {
    uploadEventImages.single('images')(req, res, async(err) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi khi upload ảnh: ' + err.message });
        }

        try {
            const organizer_id = req.user._id;
            const { title, description, location, category_id, date } = req.body;

            const dateString = date;

            const [dayMonthYear, time] = dateString.split(' ');
            if (!dayMonthYear || !time) {
                return res.status(400).json({ message: 'Định dạng ngày không hợp lệ. Định dạng đúng là: dd-mm-yyyy hh:mm:ss' });
            }

            const [day, month, year] = dayMonthYear.split('-');
            const [hours, minutes, seconds] = time.split(':');

           
            if (
                !day || !month || !year || !hours || !minutes || !seconds ||
                isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)
            ) {
                return res.status(400).json({ message: 'Định dạng ngày hoặc giờ không hợp lệ.' });
            }

           
            const eventDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
            if (isNaN(eventDate.getTime())) {
                return res.status(400).json({ message: 'Không thể chuyển đổi ngày thành định dạng hợp lệ.' });
            }
            const image = req.file ?
                `${req.protocol}://${req.get('host')}/public/eventImage/${req.file.filename}` :
                null;

            if (!image) {
                return res.status(400).json({ message: 'Hình ảnh sự kiện là bắt buộc' });
            }

            const event = new Event({
                title,
                organizer_id,
                description,
                location,
                date: eventDate,
                category_id,
                images: image,
            });

            await event.save();

            res.status(201).json({
                message: 'Tạo sự kiện thành công!',
                event,
            });
        } catch (error) {
            res.status(400).json({ message: `Không thể tạo sự kiện: ${error.message}` });
        }
    });
};
// Lấy danh sách tất cả sự kiện
exports.getAllEvents = async(req, res) => {
    try {
        const events = await Event.find().lean();

        res.status(200).json({
            message: 'Lấy danh sách sự kiện thành công!',
            events, // Trả về trực tiếp danh sách sự kiện
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy danh sách sự kiện: ${error.message}` });
    }
};;


// Lấy thông tin sự kiện theo ID
exports.getEventById = async(req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
        if (!event) {
            return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }

        res.status(200).json({
            message: 'Lấy thông tin sự kiện thành công!',
            event,
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy thông tin sự kiện: ${error.message}` });
    }
};


// Lấy danh sách sự kiện theo userId từ tài khoản hiện tại
exports.getEventsByCurrentUser = async(req, res) => {
    try {
        const userId = req.user._id;

        const events = await Event.find({ organizer_id: userId })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            message: 'Lấy danh sách sự kiện thành công!',
            events,
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy danh sách sự kiện: ${error.message}` });
    }
};



exports.updateEvent = async(req, res) => {
    uploadEventImages.single('images')(req, res, async(err) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi khi upload ảnh: ' + err.message });
        }

        try {
            const { id } = req.params;
            if (req.body.date) {
                const dateString = req.body.date;
                const [time, dayMonthYear] = dateString.split(' ');
                if (!time || !dayMonthYear) {
                    return res.status(400).json({ message: 'Định dạng ngày không hợp lệ' });
                }

                const [day, month, year] = dayMonthYear.split('-');
                const [hours, minutes, seconds] = time.split(':');
                if (!day || !month || !year || !hours || !minutes || !seconds) {
                    return res.status(400).json({ message: 'Định dạng ngày hoặc giờ không hợp lệ' });
                }

                req.body.date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
                if (isNaN(req.body.date.getTime())) {
                    return res.status(400).json({ message: 'Không thể chuyển đổi ngày thành định dạng hợp lệ' });
                }
            }
            if (req.file) {
                req.body.images = `${req.protocol}://${req.get('host')}/public/eventImage/${req.file.filename}`;
            }
            const event = await Event.findByIdAndUpdate(id, req.body, { new: true });
            if (!event) {
                return res.status(404).json({ message: 'Không tìm thấy sự kiện để cập nhật' });
            }

            res.status(200).json({
                message: 'Cập nhật sự kiện thành công!',
                event,
            });
        } catch (error) {
            res.status(500).json({ message: `Không thể cập nhật sự kiện: ${error.message}` });
        }
    });
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