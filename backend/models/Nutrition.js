const mongoose = require('mongoose');

const nutritionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        mealType: {
            type: String,
            required: true, // Breakfast, Lunch, Dinner, Snack
        },
        foodName: {
            type: String,
            required: true,
        },
        calories: {
            type: Number,
            required: true,
        },
        protein: {
            type: Number,
            default: 0,
        },
        carbs: {
            type: Number,
            default: 0,
        },
        fat: {
            type: Number,
            default: 0,
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

const Nutrition = mongoose.model('Nutrition', nutritionSchema);

module.exports = Nutrition;
