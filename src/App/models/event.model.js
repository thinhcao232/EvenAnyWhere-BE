const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    organizer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'accountUser'
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: mongoose.Types.Decimal128
    },
    images: {
        type: [String],
        default: []
    }, // tối đa 6 ảnh
    hasLiveStream: {
        type: Boolean,
        default: false
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


eventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', eventSchema);