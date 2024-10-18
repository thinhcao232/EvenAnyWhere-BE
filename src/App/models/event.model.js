const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event_id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),  
        unique: true
    },
    organizer_id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    keywords: {
        type: Map,  
        of: String
    },
    date: {
        type: Date
    },
    location: {
        type: String
    },
    banner: {
        type: String  
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Hoạt động", "Không hoạt động", "Đã hủy"],
        default: "Không hoạt động"
    }
});

module.exports = mongoose.model('Event', eventSchema);
