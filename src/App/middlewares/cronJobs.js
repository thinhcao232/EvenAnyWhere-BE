const cron = require('node-cron');
const { DateTime } = require('luxon');
const AccountUser = require('../models/accountUser.model');
const Session = require('../models/session.model');
const SessionSpeaker = require('../models/sessionSpeaker.model');


const deactivateSpeakersAfterSessionEnd = () => {
    //kiểm tra 1p/1 lần
    cron.schedule('*/60 * * * * *', async() => {
        try {

            const now = DateTime.now().setZone('Asia/Ho_Chi_Minh').plus({ days: 1 });
            const expiredSessions = await Session.find({
                end_time: { $lte: now.toJSDate() },
            });
            //console.log("End Time:", expiredSessions);

            if (expiredSessions.length >= 0) {
                const expiredSessionIds = expiredSessions.map((session) => session._id);


                const speakersToDeactivate = await SessionSpeaker.find({
                    session_id: { $in: expiredSessionIds },
                });

                //console.log("Now:", now.toISO());
                //console.log("Speakers to deactivate:", speakersToDeactivate);

                if (speakersToDeactivate.length > 0) {
                    const speakerEmails = speakersToDeactivate.map((speaker) => speaker.email);


                    const activeSpeakers = await AccountUser.find({
                        email: { $in: speakerEmails },
                        activeSpeaker: true,
                    });

                    if (activeSpeakers.length > 0) {
                        await AccountUser.updateMany({ email: { $in: speakerEmails }, activeSpeaker: true }, { $set: { activeSpeaker: false } });
                        console.log("Now:", now.toISO());
                        console.log(
                            `Đã tắt quyền activeSpeaker cho ${activeSpeakers.length} speakers:`,
                            activeSpeakers.map((speaker) => speaker.email)
                        );
                    } else {
                        console.log("Không có speakers nào cần cập nhật trạng thái.");
                    }
                } else {
                    console.log("Không có speakers nào thuộc các sessions đã hết hạn.");
                }
            } else {
                console.log("Không có sessions nào đã hết hạn.");
            }
        } catch (error) {
            console.error('Lỗi khi tắt quyền activeSpeaker:', error.message);
        }
    });
};

module.exports = deactivateSpeakersAfterSessionEnd;