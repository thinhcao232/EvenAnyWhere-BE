const EventParticipation = require('../models/eventParticipation.model');

exports.joinEvent = async(req, res) => {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({ message: 'userId và eventId là bắt buộc.' });
        }

        const existingParticipation = await EventParticipation.findOne({ account_id: userId, event_id: eventId });

        // Nếu đã tồn tại, trả về lỗi 409
        if (existingParticipation) {
            return res.status(400).json({
                message: 'Người dùng đã tồn tại trong danh sách tham gia sự kiện.',
            });
        }

        // Nếu chưa có, tạo mới bản ghi
        const newParticipation = new EventParticipation({
            account_id: userId,
            event_id: eventId,
            hasJoin: true
        });
        await newParticipation.save();

        return res.status(200).json({
            message: 'Tham gia sự kiện thành công.',
            data: {
                account_id: newParticipation.account_id,
                event_id: newParticipation.event_id,
                hasJoin: true
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tham gia sự kiện.', error });
    }
};

exports.checkHasJoin = async(req, res) => {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({ message: 'userId và eventId là bắt buộc.' });
        }

        const participation = await EventParticipation.findOne({ account_id: userId, event_id: eventId });

        if (!participation) {
            return res.status(404).json({
                message: 'Không tìm thấy thông tin tham gia sự kiện.',
                data: { hasJoin: false }
            });
        }

        return res.status(200).json({
            message: 'Kiểm tra trạng thái tham gia thành công.',
            data: {
                account_id: participation.account_id,
                event_id: participation.event_id,
                hasJoin: participation.hasJoin,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi kiểm tra trạng thái tham gia.', error });
    }
};