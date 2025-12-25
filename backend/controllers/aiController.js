const asyncHandler = require('express-async-handler');
const AIProfile = require('../models/AIProfile');

// @desc    Get or Create AI Profile
// @route   POST /api/ai/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    let profile = await AIProfile.findOne({ user: req.user._id });

    if (profile) {
        profile = await AIProfile.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true }
        );
    } else {
        profile = await AIProfile.create({
            user: req.user._id,
            ...req.body
        });
    }
    res.status(200).json(profile);
});

// @desc    Get AI Recommendations
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    const profile = await AIProfile.findOne({ user: req.user._id });

    if (!profile) {
        res.status(404);
        throw new Error('Please create an AI Profile first');
    }

    // --- AI Logic Engine (Rule Based) ---

    // 1. Calculate BMR (Harris-Benedict Equation)
    let bmr;
    if (profile.gender === 'Male') {
        bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
        bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    // 2. TDEE based on generic activity multiplier (assuming Moderate for now, or based on daysPerWeek)
    let activityMultiplier = 1.2;
    if (profile.daysPerWeek >= 3) activityMultiplier = 1.375;
    if (profile.daysPerWeek >= 5) activityMultiplier = 1.55;
    if (profile.daysPerWeek === 7) activityMultiplier = 1.725;

    let tdee = Math.round(bmr * activityMultiplier);

    // 3. Adjust for Goal
    let calorieTarget = tdee;
    let advice = "";
    let workoutPlan = "";

    if (profile.goal === 'Weight Loss') {
        calorieTarget -= 500;
        advice = "Focus on a caloric deficit. Incorporate HIIT and cardio.";
        workoutPlan = "Mix of Cardio (30m) and Strength Training (3 sets x 12 reps).";
    } else if (profile.goal === 'Muscle Gain') {
        calorieTarget += 300;
        advice = "Surplus requires protein. Lift heavy!";
        workoutPlan = "Hypertrophy focus. Split routine (Push/Pull/Legs).";
    } else {
        advice = "Maintain balance. Consistency is key.";
        workoutPlan = "Full Body workouts to maintain tone.";
    }

    // 4. Macro Split (Simplistic)
    const protein = Math.round((calorieTarget * 0.3) / 4);
    const carbs = Math.round((calorieTarget * 0.4) / 4);
    const fats = Math.round((calorieTarget * 0.3) / 9);

    const recommendation = {
        calories: calorieTarget,
        macros: { protein, carbs, fats },
        summary: advice,
        workout: workoutPlan,
        tip: "Remember to drink 3L of water today!",
        generatedAt: new Date()
    };

    res.status(200).json(recommendation);
});

// @desc    Get AI Profile Data
// @route   GET /api/ai/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const profile = await AIProfile.findOne({ user: req.user._id });
    if (!profile) {
        res.status(404);
        throw new Error('Profile not found');
    }
    res.status(200).json(profile);
});

module.exports = {
    updateProfile,
    getRecommendations,
    getProfile
};
