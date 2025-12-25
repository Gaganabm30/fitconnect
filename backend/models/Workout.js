const mongoose = require('mongoose');

const workoutSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            required: true, // Cardio, Strength, Yoga, etc.
        },
        intensity: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        duration: {
            type: Number, // in minutes
            required: true,
        },
        calories: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
