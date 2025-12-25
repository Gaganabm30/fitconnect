const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Steps', 'Calories', 'Workouts', 'Minutes'],
        required: true
    },
    targetValue: {
        type: Number,
        required: true
    },
    currentProgress: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Expired'],
        default: 'Active'
    },
    contributors: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        value: { type: Number, default: 0 }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
