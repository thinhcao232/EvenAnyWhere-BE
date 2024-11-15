const Event = require('../models/event.model');
const AccountUser = require('../models/accountUser.model');
const Session = require('../models/session.model');
const SessionSpeaker = require('../models/sessionSpeaker.model');

exports.getEventDetails = async(req, res) => {
    const { id } = req.params;
    try {

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Sự kiện không tồn tại' });
        }

        const organizer = await AccountUser.findById(event.organizer_id)
            .select('name image');


        const sessions = await Session.find({ event_id: event._id });


        const sessionDetails = await Promise.all(
            sessions.map(async(session) => {

                const sessionSpeakers = await SessionSpeaker.find({ session_id: session._id });

                const sessionSpeakerDetails = await Promise.all(
                    sessionSpeakers.map(async(speaker) => {
                        const speakerDetails = await AccountUser.findOne({ email: speaker.email });

                        return {
                            id: speakerDetails._id,
                            name: speakerDetails.name,
                            bio: speakerDetails.description,
                            profileImageUrl: speakerDetails.image,
                        };
                    })
                );

                return {
                    id: session._id,
                    title: session.title,
                    startTime: session.start_time,
                    endTime: session.end_time,
                    sessionSpeakers: sessionSpeakerDetails,
                };
            })
        );

        const speakers = await SessionSpeaker.find({ session_id: { $in: sessions.map((s) => s._id) } });

        // Tạo Set để kiểm tra tính duy nhất của id
        const speakerSet = new Set();
        const speakerList = [];

        // Lọc và thêm speaker duy nhất vào speakerList
        for (const speaker of speakers) {
            const speakerDetails = await AccountUser.findOne({ email: speaker.email });

            if (!speakerSet.has(speakerDetails._id.toString())) {
                speakerSet.add(speakerDetails._id.toString());
                speakerList.push({
                    id: speakerDetails._id,
                    name: speakerDetails.name,
                    profileImageUrl: speakerDetails.image,
                });
            }
        }

        res.status(200).json({
            id: event._id,
            title: event.title,
            image: event.images,
            description: event.description,
            date: event.date,
            location: event.location,
            organizer: organizer ? {
                id: organizer._id,
                name: organizer.name,
                image: organizer.image,
            } : null,
            sessions: sessionDetails,
            speakers: speakerList,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi lấy chi tiết sự kiện',
            error: error.message,
        });
    }
};