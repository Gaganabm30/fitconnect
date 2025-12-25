const mongoose = require('mongoose');

const burnoutMetricsSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        weeklyWorkoutCount: {
            type: Number,
            default: 0,
        },
        avgIntensity: {
            type: String, // 'Low', 'Medium', 'High' - derived from average score
        },
        restDays: {
            type: Number,
            default: 0,
        },
        consistencyScore: {
            type: Number, // 0-100
            default: 100,
        },
        burnoutLevel: {
            type: String,
            enum: ['Low Risk', 'Moderate Risk', 'High Risk'],
            default: 'Low Risk',
        },
        sleepHours: {
            type: Number, // Optional manual input
        },
        lastEvaluated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const BurnoutMetrics = mongoose.model('BurnoutMetrics', burnoutMetricsSchema);

module.exports = BurnoutMetrics;
