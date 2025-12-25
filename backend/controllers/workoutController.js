const asyncHandler = require('express-async-handler');
const Workout = require('../models/Workout');
const Team = require('../models/Team');
const Challenge = require('../models/Challenge');

// @desc    Get workouts
// @route   GET /api/workouts
// @access  Private
const getWorkouts = asyncHandler(async (req, res) => {
    const workouts = await Workout.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(workouts);
});

// @desc    Set workout
// @route   POST /api/workouts
// @access  Private
const setWorkout = asyncHandler(async (req, res) => {
    if (!req.body.type || !req.body.duration || !req.body.calories) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const workout = await Workout.create({
        type: req.body.type,
        duration: req.body.duration,
        calories: req.body.calories,
        date: req.body.date || Date.now(),
        user: req.user.id,
    });

    // --- Team Collaboration Logic ---
    const team = await Team.findOne({ members: req.user.id });
    if (team) {
        // Find active challenges for this team
        const activeChallenges = await Challenge.find({ team: team._id, status: 'Active' });

        for (const challenge of activeChallenges) {
            let increment = 0;
            if (challenge.type === 'Calories') increment = Number(req.body.calories);
            if (challenge.type === 'Minutes') increment = Number(req.body.duration);
            if (challenge.type === 'Workouts') increment = 1;
            // 'Steps' handled separately or assume manual entry, ignoring for generic workout log for now

            if (increment > 0) {
                challenge.currentProgress += increment;

                // Update contributor stats
                const contributor = challenge.contributors.find(c => c.user.toString() === req.user.id);
                if (contributor) {
                    contributor.value += increment;
                } else {
                    challenge.contributors.push({ user: req.user.id, value: increment });
                }

                // Check completion
                if (challenge.currentProgress >= challenge.targetValue) {
                    challenge.status = 'Completed';
                    team.activityFeed.unshift({
                        user: req.user.id,
                        message: `helped complete the challenge: ${challenge.title}! 🎉`,
                        type: 'CHALLENGE_COMPLETED'
                    });
                }

                await challenge.save();
            }
        }

        // Add plain workout log to feed
        team.activityFeed.unshift({
            user: req.user.id,
            message: `logged a ${req.body.type} workout (${req.body.calories} kcal)`,
            type: 'WORKOUT'
        });

        // Limit feed size
        if (team.activityFeed.length > 50) team.activityFeed = team.activityFeed.slice(0, 50);

        await team.save();
    }
    // -----------------------------

    res.status(200).json(workout);
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
        res.status(400);
        throw new Error('Workout not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the workout user
    if (workout.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).json(updatedWorkout);
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
        res.status(400);
        throw new Error('Workout not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the workout user
    if (workout.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await workout.deleteOne(); // or workout.remove() depending on mongoose version

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getWorkouts,
    setWorkout,
    updateWorkout,
    deleteWorkout,
};
