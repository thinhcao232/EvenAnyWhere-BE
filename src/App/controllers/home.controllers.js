const Category = require('../models/categoryEvent.model'); // Import mô hình danh mục
const Event = require('../models/event.model');

// Tìm kiếm sự kiện theo tên hoặc ký tự
exports.searchEventsByTitle = async (req, res) => {
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

// Lọc sự kiện (Thể loại, thời gian, vị trí)
exports.filterEvents = async (req, res) => {
    try {
        const { category_id, dateOption, location, date } = req.query;
        const filter = {};

        // Lọc theo thể loại
        if (category_id) {
            filter.category_id = category_id;
        }

        // Lọc theo ngày cụ thể (kiểm tra tính hợp lệ của date)
        if (date) {
            const selectedDate = new Date(date);
            if (!isNaN(selectedDate)) {
                filter.date = {
                    $gte: selectedDate.setHours(0, 0, 0, 0),
                    $lt: selectedDate.setHours(23, 59, 59, 999)
                };
            } else {
                return res.status(400).json({ message: 'Ngày không hợp lệ' });
            }
        }

        // Lọc theo ngày với dateOption
        if (dateOption) {
            const currentDate = new Date();
            if (dateOption === 'today') {
                filter.date = {
                    $gte: currentDate.setHours(0, 0, 0, 0),
                    $lt: currentDate.setHours(23, 59, 59, 999)
                };
            } else if (dateOption === 'tomorrow') {
                const tomorrow = new Date(currentDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                filter.date = {
                    $gte: tomorrow.setHours(0, 0, 0, 0),
                    $lt: tomorrow.setHours(23, 59, 59, 999)
                };
            } else if (dateOption === 'this_week') {
                const endOfWeek = new Date(currentDate);
                endOfWeek.setDate(currentDate.getDate() + (7 - currentDate.getDay()));
                filter.date = {
                    $gte: currentDate,
                    $lt: endOfWeek
                };
            }
        }

        // Lọc theo vị trí
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        const events = await Event.find(filter).lean();

        // Kiểm tra nếu không tìm thấy sự kiện nào
        if (events.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy sự kiện nào!',
                events: []
            });
        }

        // Trả về sự kiện nếu tìm thấy
        res.status(200).json({
            message: 'Lọc sự kiện thành công!',
            events
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lọc sự kiện: ${error.message}` });
    }
};

