const cron = require('node-cron');
const AccountUser = require("../App/models/accountUser.model");
const SessionSpeaker = require("../App/models/sessionSpeaker.model");

// Cron job chạy mỗi phút
cron.schedule('*/1 * * * *', async() => {
    try {
        const speakers = await AccountUser.find({ activeSpeaker: true });
        speakers.forEach(async(speaker) => {
            const currentTime = new Date();
            const end = new Date(speaker.speaker_end_time);

            if (currentTime < end) {

                speaker.activeSpeaker = false;
                speaker.speaker_end_time = null;

                await speaker.save();
                console.log(`Đã cập nhật quyền speaker cho ${speaker.email}, chuyển về attendee.`);

                // Xóa thông tin speaker khỏi bảng SessionSpeaker
                //   await SessionSpeaker.deleteMany({ email: speaker.email });
                //  console.log(`Đã xóa thông tin speaker của ${speaker.email} khỏi bảng SessionSpeaker.`);
            }
        });
    } catch (error) {
        console.error('Lỗi khi chạy Cron job:', error.message);
    }
});