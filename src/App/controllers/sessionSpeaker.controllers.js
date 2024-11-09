const SessionSpeaker = require('../models/sessionSpeaker.model');
const AccountUser = require('../models/accountUser.model');

exports.addSpeakerByEmail = async(req, res) => {
    try {
        const { session_id, email, speaker_end_time } = req.body;

        const attendee = await AccountUser.findOne({ email });

        if (!attendee) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (attendee.activeSpeaker === true) {
            return res.status(400).json({ message: 'Người dùng đã là speaker' });
        }

        // Chuyển đổi thời gian từ định dạng HH:mm:ss DD-MM-YYYY sang ISO cho speaker_end_time
        const [endTimeStr, endDateStr] = speaker_end_time.split(' ');
        const [endDay, endMonth, endYear] = endDateStr.split('-');
        const [endHour, endMinute, endSecond] = endTimeStr.split(':');
        const speakerEndTimeISO = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHour, endMinute, endSecond));

        const currentTime = new Date();
        if (speakerEndTimeISO < currentTime) {
            return res.status(400).json({ message: 'Thời gian kết thúc phải lớn hơn thời gian hiện tại.' });
        }
        attendee.activeSpeaker = true;
        attendee.speaker_end_time = speakerEndTimeISO;
        await attendee.save();

        const newSessionSpeaker = new SessionSpeaker({
            session_id,
            email: attendee.email,
            endTime: speakerEndTimeISO
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