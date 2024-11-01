const LiveStream = require('../models/livestreamInfo.model');

exports.createLiveStream = async(req, res) => {
    try {
        const { session_id, startedAt, endAt } = req.body;

        // Chuyển chuỗi từ định dạng 'HH:mm:ss DD-MM-YYYY' sang 'YYYY-MM-DDTHH:mm:ss'
        const formattedStartAt = startedAt ? new Date(startedAt.replace(/(\d{2}):(\d{2}):(\d{2}) (\d{2})-(\d{2})-(\d{4})/, '$6-$5-$4T$1:$2:$3+07:00')) : null;
        const formattedEndAt = endAt ? new Date(endAt.replace(/(\d{2}):(\d{2}):(\d{2}) (\d{2})-(\d{2})-(\d{4})/, '$6-$5-$4T$1:$2:$3+07:00')) : null;

        const liveStream = await LiveStream.create({
            session_id,
            startedAt: formattedStartAt,
            endAt: formattedEndAt,
        });

        res.status(201).json(liveStream);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getLiveStreamById = async(req, res) => {
    try {
        const liveStream = await LiveStream.findById(req.params.id);
        if (!liveStream) return res.status(404).json({ message: 'LiveStream not found' });
        res.json(liveStream);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteLiveStream = async(req, res) => {
    try {
        const liveStream = await LiveStream.findByIdAndDelete(req.params.id);
        if (!liveStream) return res.status(404).json({ message: 'LiveStream not found' });
        res.json({ message: 'LiveStream deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};