const mongoose = require('mongoose');

const foodLogSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        inputQuery: {
            type: String,
            required: true,
        },
        parsedFood: [
            {
                foodName: String,
                quantity: String,
                calories: String, // Range or single number as string
                confidence: String,
            }
        ],
        totalCalories: {
            type: String, // Range e.g. "400-500"
        },
        confidence: {
            type: String, // Low, Medium, High
        },
        explanation: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('FoodLog', foodLogSchema);
