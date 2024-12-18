const EventParticipation = require('../models/eventParticipation.model');

exports.joinEvent = async(req, res) => {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({ message: 'userId và eventId là bắt buộc.' });
        }

        let participation = await EventParticipation.findOne({ account_id: userId, event_id: eventId });

        if (!participation) {
            participation = new EventParticipation({ account_id: userId, event_id: eventId, hasJoin: false });
            await participation.save();
        }

        // Nếu đã tham gia (hasJoin: true), trả về thông tin đã tham gia
        if (participation.hasJoin) {
            return res.status(200).json({
                message: 'Người dùng đã tham gia sự kiện.',
                data: { account_id: userId, event_id: eventId, hasJoin: true }
            });
        } else {
            participation.hasJoin = true;
            participation.updatedAt = Date.now();
            await participation.save();

            return res.status(200).json({
                message: 'Tham gia sự kiện thành công.',
                data: { account_id: userId, event_id: eventId, hasJoin: true }
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tham gia sự kiện.', error });
    }
};