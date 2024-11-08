const Session = require('../models/session.model');

exports.createSession = async(req, res) => {
    try {
        const { event_id } = req.params;
        const { title, description, start_time, end_time, location, maxAttendees, isLiveStream } = req.body;

        const newSession = new Session({
            event_id,
            title,
            description,
            start_time,
            end_time,
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
        res.status(500).json({
            message: 'Tạo phiên mới thất bại!',
            error: error.message,
        });
    }
};

// Lấy tất cả các phiên của một sự kiện
exports.getAllSessionsByEvent = async(req, res) => {
    try {
        const { event_id } = req.params;
        const sessions = await Session.find({ event_id });

        res.status(200).json({
            message: 'Lấy danh sách các phiên thành công!',
            sessions,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lấy danh sách các phiên thất bại!',
            error: error.message,
        });
    }
};

exports.updateSession = async(req, res) => {
    try {
        const { session_id } = req.params;
        const updatedSession = await Session.findByIdAndUpdate(session_id, req.body, { new: true });

        if (!updatedSession) {
            return res.status(404).json({
                message: 'Phiên không tồn tại',
            });
        }

        res.status(200).json({
            message: 'Cập nhật phiên thành công!',
            session: updatedSession,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Cập nhật phiên thất bại!',
            error: error.message,
        });
    }
};

exports.deleteSession = async(req, res) => {
    try {
        const { session_id } = req.params;
        const session = await Session.findByIdAndDelete(session_id);

        if (!session) {
            return res.status(404).json({
                message: 'Phiên không tồn tại',
            });
        }

        res.status(200).json({
            message: 'Xóa phiên thành công!',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Xóa phiên thất bại!',
            error: error.message,
        });
    }

};
exports.getSessionById = async(req, res) => {
    try {
        const { session_id } = req.params;
        const session = await Session.findById(session_id);

        if (!session) {
            return res.status(404).json({
                message: 'Phiên không tồn tại',
            });
        }

        res.status(200).json({
            message: 'Lấy thông tin chi tiết của phiên thành công!',
            session,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lấy thông tin chi tiết của phiên thất bại!',
            error: error.message,
        });
    }
};