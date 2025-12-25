const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Workout = require('../models/Workout');

// @desc    Add friend
// @route   POST /api/social/friends/:id
// @access  Private
const addFriend = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.id);

    if (!friend) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.friends.includes(friend.id)) {
        res.status(400);
        throw new Error('Already friends');
    }

    // Add to both lists for mutual friendship or just one way? Assuming following model for simplicity or mutual driven by User model
    user.friends.push(friend.id);
    await user.save();

    res.status(200).json({ message: 'Friend added' });
});

// @desc    Get leaderboard (top users by calories burned)
// @route   GET /api/social/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
    // Aggregate total calories per user
    // This is a simplified leaderboard.
    // In a real app, you'd aggregate Workout documents.

    const leaderboard = await Workout.aggregate([
        {
            $group: {
                _id: '$user',
                totalCalories: { $sum: '$calories' },
                totalDuration: { $sum: '$duration' }
            }
        },
        { $sort: { totalCalories: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $project: {
                _id: 1,
                totalCalories: 1,
                totalDuration: 1,
                name: { $arrayElemAt: ['$userInfo.name', 0] }
            }
        }
    ]);

    res.json(leaderboard);
});

module.exports = { addFriend, getLeaderboard };
