const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.age = req.body.age || user.age;
        user.height = req.body.height || user.height;
        user.weight = req.body.weight || user.weight;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            age: updatedUser.age,
            height: updatedUser.height,
            weight: updatedUser.weight,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users (for friends search)
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    // Simple search or get all, limit to 20
    const keyword = req.query.search
        ? {
            name: {
                $regex: req.query.search,
                $options: 'i',
            },
        }
        : {};

    const users = await User.find({ ...keyword, _id: { $ne: req.user.id } })
        .select('-password')
        .limit(20);
    res.json(users);
});

module.exports = { updateUserProfile, getUsers };
