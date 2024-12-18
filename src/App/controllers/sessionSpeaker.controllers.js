const SessionSpeaker = require('../models/sessionSpeaker.model');
const AccountUser = require('../models/accountUser.model');

exports.addSpeakerByEmail = async(req, res) => {
    try {
        const { session_id, email, position } = req.body;

        const attendee = await AccountUser.findOne({ email });
        if (!attendee) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        const existingSessionSpeaker = await SessionSpeaker.findOne({ session_id, email });
        if (existingSessionSpeaker) {
            return res.status(400).json({ message: 'Người dùng đã là speaker trong phiên này' });
        }
        attendee.activeSpeaker = true;
        await attendee.save();

        const newSessionSpeaker = new SessionSpeaker({
            session_id,
            email: attendee.email,
            position
        });
        await newSessionSpeaker.save();
        res.status(201).json({
            message: 'Đã thêm speaker vào phiên thành công!',
            sessionSpeaker: newSessionSpeaker,
            speaker: {
                name: attendee.name,
                image: attendee.image,
                email: attendee.email,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Không thể thêm speaker vào phiên',
            error: error.message,
        });
    }
}

exports.getSpeakersBySession = async(req, res) => {
    const { session_id } = req.params;

    try {
        const sessionSpeakers = await SessionSpeaker.find({ session_id }).lean();

        if (sessionSpeakers.length === 0) {
            return res.status(404).json({ message: 'Không có speaker trong session này' });
        }
        const speakersInfo = await Promise.all(sessionSpeakers.map(async(sessionSpeaker) => {
            const speaker = await AccountUser.findOne({ email: sessionSpeaker.email }, 'name email image');
            return {...sessionSpeaker, speaker };
        }));

        res.status(200).json({
            message: 'Lấy danh sách speaker thành công!',
            sessionSpeakers: speakersInfo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách speaker', error: error.message });
    }
};