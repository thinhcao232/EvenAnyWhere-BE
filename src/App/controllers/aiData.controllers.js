const AccountUser = require('../models/accountUser.model');
const Event = require('../models/event.model');
const EventParticipation = require('../models/eventParticipation.model');

exports.getMatrixForAI = async(req, res) => {
    try {

        const users = await AccountUser.find({}, '_id'); // Chỉ lấy _id
        const events = await Event.find({}, '_id'); // Chỉ lấy _id

        // Tạo ánh xạ ID -> index cho người dùng và sự kiện
        const userIndexMap = new Map(users.map((user, index) => [user._id.toString(), index]));
        const eventIndexMap = new Map(events.map((event, index) => [event._id.toString(), index]));

        // 2. Khởi tạo ma trận rỗng (userCount x eventCount)
        const userCount = users.length;
        const eventCount = events.length;
        const matrix = Array.from({ length: userCount }, () => Array(eventCount).fill(0));

        // 3. Lấy thông tin tham gia sự kiện
        const participations = await EventParticipation.find({}, 'account_id event_id hasJoin');

        // 4. Điền dữ liệu vào ma trận
        participations.forEach(participation => {
            const userIndex = userIndexMap.get(participation.account_id.toString());
            const eventIndex = eventIndexMap.get(participation.event_id.toString());

            if (userIndex !== undefined && eventIndex !== undefined) {
                matrix[userIndex][eventIndex] = participation.hasJoin ? 1 : 0;
            }
        });

        // 5. Trả về kết quả
        res.json({ success: true, matrix });
    } catch (error) {
        console.error('Error generating matrix for AI:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};