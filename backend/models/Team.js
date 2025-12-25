const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    activityFeed: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        type: { type: String, enum: ['JOIN', 'WORKOUT', 'CHALLENGE_CREATED', 'CHALLENGE_COMPLETED'] },
        createdAt: { type: Date, default: Date.now }
    }],
    chat: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    totalScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
