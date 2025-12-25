const mongoose = require('mongoose');

const goalSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            required: true, // Weight, Workout Frequency, Steps
        },
        targetValue: {
            type: Number,
            required: true,
        },
        currentValue: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['In Progress', 'Achieved'],
            default: 'In Progress',
        },
        deadline: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
