const AccountUser = require('../models/accountUser.model');
const Event = require('../models/event.model');
const EventParticipation = require('../models/eventParticipation.model');
const CategoryEvent = require('../models/categoryEvent.model');

// Lấy danh sách user với hobbies
exports.getUsers = async(req, res) => {
    try {
        const users = await AccountUser.find({}, '_id hobbies');
        const userList = users.map(user => ({
            user_id: user._id,
            hobbies: user.hobbies
        }));
        res.status(200).json({
            success: true,
            data: userList
        });
    } catch (error) {
        console.error('Error fetching _id and hobbies:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.getEvents = async(req, res) => {
    try {
        // Tìm tất cả sự kiện và populate để lấy tên category
        const events = await Event.find({}, 'title date category_id')
            .populate('category_id', 'name'); // Populate chỉ trường 'name' của category

        // Chuyển dữ liệu thành định dạng mong muốn
        const eventList = events.map(event => ({
            event_id: event._id,
            title: event.title,
            category_name: event.category_id && event.category_id.name ? event.category_id.name : null,
            date: event.date
        }));

        res.status(200).json({
            success: true,
            data: eventList
        });
    } catch (error) {
        console.error('Error fetching events with categories:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Controller lấy danh sách tất cả các cặp user_id và event_id
exports.getJoin = async(req, res) => {
    try {
        // Lấy tất cả user
        const users = await AccountUser.find({}, '_id').lean();
        const userIds = users.map(user => user._id.toString());

        // Lấy tất cả event
        const events = await Event.find({}, '_id').lean();
        const eventIds = events.map(event => event._id.toString());

        // Lấy tất cả tham gia
        const participations = await EventParticipation.find({}, 'account_id event_id hasJoin').lean();

        // Tạo mảng ghép từng cặp user_id và event_id
        const interactions = [];
        userIds.forEach(userId => {
            eventIds.forEach(eventId => {
                // Kiểm tra xem user và event có trong tham gia hay không
                const participation = participations.find(
                    p => p.account_id.toString() === userId && p.event_id.toString() === eventId
                );

                interactions.push({
                    user_id: userId,
                    event_id: eventId,
                    join: participation && participation.hasJoin ? 1 : 0
                });
            });
        });
        const totalPairs = interactions.length; // Tổng số cặp user-event
        const totalUsers = userIds.length; // Tổng số user
        const totalEvents = eventIds.length;
        // Trả về kết quả
        res.status(200).json({
            success: true,
            data: interactions
        });
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};