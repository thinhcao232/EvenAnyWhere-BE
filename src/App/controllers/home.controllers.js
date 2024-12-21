const Category = require('../models/categoryEvent.model'); // Import mô hình danh mục
const Event = require('../models/event.model');

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

// Lọc sự kiện (Thể loại, thời gian, vị trí)
exports.filterEvents = async(req, res) => {
    try {
        const { category_id, dateOption, location, date } = req.query;
        const filter = {};
        // Lọc theo nhiều thể loại (category_id)
        if (category_id) {
            const categoryIds = category_id.split(',').map((id) => id.trim());
            filter.category_id = { $in: categoryIds };
        }
        // Lọc theo ngày cụ thể (định dạng dd-mm-yyyy)
        if (date) {
            const [day, month, year] = date.split('-');
            if (!day || !month || !year ||
                isNaN(day) || isNaN(month) || isNaN(year)
            ) {
                return res.status(400).json({ message: 'Ngày không hợp lệ. Định dạng yêu cầu là dd-mm-yyyy' });
            }

            const selectedDate = new Date(Date.UTC(year, month - 1, day));
            if (!isNaN(selectedDate)) {
                filter.date = {
                    $gte: selectedDate.setHours(0, 0, 0, 0),
                    $lt: selectedDate.setHours(23, 59, 59, 999),
                };
            } else {
                return res.status(400).json({ message: 'Không thể chuyển đổi ngày thành định dạng hợp lệ.' });
            }
        }
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
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        const events = await Event.find(filter).sort({ createdAt: -1 }).lean();

        if (events.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy sự kiện nào!',
                events: []
            });
        }
        res.status(200).json({
            message: 'Lọc sự kiện thành công!',
            events
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lọc sự kiện: ${error.message}` });
    }
};