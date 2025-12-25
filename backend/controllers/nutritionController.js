const asyncHandler = require('express-async-handler');
const Nutrition = require('../models/Nutrition');

// @desc    Get meals
// @route   GET /api/nutrition
// @access  Private
const getMeals = asyncHandler(async (req, res) => {
    const meals = await Nutrition.find({ user: req.user.id });
    res.status(200).json(meals);
});

// @desc    Add meal
// @route   POST /api/nutrition
// @access  Private
const addMeal = asyncHandler(async (req, res) => {
    const { mealType, foodName, calories, protein, carbs, fat, date } = req.body;

    if (!mealType || !foodName || !calories) {
        res.status(400);
        throw new Error('Please add required fields');
    }

    const meal = await Nutrition.create({
        user: req.user.id,
        mealType,
        foodName,
        calories,
        protein,
        carbs,
        fat,
        date: date || Date.now(),
    });

    res.status(200).json(meal);
});

// @desc    Delete meal
// @route   DELETE /api/nutrition/:id
// @access  Private
const deleteMeal = asyncHandler(async (req, res) => {
    const meal = await Nutrition.findById(req.params.id);

    if (!meal) {
        res.status(400);
        throw new Error('Meal not found');
    }

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    if (meal.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await meal.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getMeals,
    addMeal,
    deleteMeal,
};
