const Session = require('../models/session.model');

// Tạo mới session
exports.createSession = async(req, res) => {
    try {
        const { event_id } = req.params;
        const { title, description, start_time, end_time, location, maxAttendees, isLiveStream } = req.body;

        // Chuyển đổi thời gian từ định dạng HH:mm:ss DD-MM-YYYY sang ISO
        const [startTimeStr, startDateStr] = start_time.split(' ');
        const [startDay, startMonth, startYear] = startDateStr.split('-');
        const [startHour, startMinute, startSecond] = startTimeStr.split(':');
        const startTimeISO = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHour, startMinute, startSecond));

        const [endTimeStr, endDateStr] = end_time.split(' ');
        const [endDay, endMonth, endYear] = endDateStr.split('-');
        const [endHour, endMinute, endSecond] = endTimeStr.split(':');
        const endTimeISO = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHour, endMinute, endSecond));

        const newSession = new Session({
            event_id,
            title,
            description,
            start_time: startTimeISO,
            end_time: endTimeISO,
            location,
            maxAttendees,
            isLiveStream,
        });

        const savedSession = await newSession.save();
        res.status(201).json({
            message: 'Tạo phiên mới thành công!',
            session: savedSession,
        });
    } catch (error) {
        res.status(400).json({ message: `Không thể tạo phiên mới: ${error.message}` });
    }
};

// Lấy danh sách tất cả các phiên theo event_id
exports.getAllSessionsByEvent = async(req, res) => {
    try {
        const { event_id } = req.params;
        const sessions = await Session.find({ event_id }).lean();

        res.status(200).json({
            message: 'Lấy danh sách các phiên thành công!',
            sessions,
        });
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy danh sách các phiên: ${error.message}` });
    }
};

// Lấy thông tin chi tiết session theo session_id
exports.getSessionById = async(req, res) => {
    try {
        const { session_id } = req.params;
        const session = await Session.findById(session_id).lean();

        if (session) {
            res.status(200).json({
                message: 'Lấy thông tin chi tiết của phiên thành công!',
                session,
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy phiên' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể lấy thông tin chi tiết của phiên: ${error.message}` });
    }
};

// Cập nhật session theo session_id
exports.updateSession = async(req, res) => {
    try {
        const { session_id } = req.params;

        // Chuyển đổi thời gian từ định dạng HH:mm:ss DD-MM-YYYY sang ISO nếu có trong body
        if (req.body.start_time) {
            const [startTimeStr, startDateStr] = req.body.start_time.split(' ');
            const [startDay, startMonth, startYear] = startDateStr.split('-');
            const [startHour, startMinute, startSecond] = startTimeStr.split(':');
            req.body.start_time = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHour, startMinute, startSecond));
        }
        if (req.body.end_time) {
            const [endTimeStr, endDateStr] = req.body.end_time.split(' ');
            const [endDay, endMonth, endYear] = endDateStr.split('-');
            const [endHour, endMinute, endSecond] = endTimeStr.split(':');
            req.body.end_time = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHour, endMinute, endSecond));
        }

        const updatedSession = await Session.findByIdAndUpdate(session_id, req.body, { new: true, lean: true });

        if (updatedSession) {
            res.status(200).json({
                message: 'Cập nhật phiên thành công!',
                session: updatedSession,
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy phiên để cập nhật' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể cập nhật phiên: ${error.message}` });
    }
};

// Xóa session theo session_id
exports.deleteSession = async(req, res) => {
    try {
        const { session_id } = req.params;
        const session = await Session.findByIdAndDelete(session_id);

        if (session) {
            res.status(200).json({ message: 'Xóa phiên thành công!' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy phiên để xóa' });
        }
    } catch (error) {
        res.status(500).json({ message: `Không thể xóa phiên: ${error.message}` });
    }
};