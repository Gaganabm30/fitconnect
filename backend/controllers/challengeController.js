const Challenge = require('../models/Challenge');
const Team = require('../models/Team');
const asyncHandler = require('express-async-handler');

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private (Admin only logic to be added later or checked here)
const createChallenge = asyncHandler(async (req, res) => {
    const { teamId, title, type, targetValue, endDate } = req.body;

    const team = await Team.findById(teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Verify user is part of the team (or admin)
    if (!team.members.includes(req.user._id)) {
        res.status(401);
        throw new Error('Not authorized to create challenge for this team');
    }

    const challenge = await Challenge.create({
        team: teamId,
        title,
        type,
        targetValue,
        endDate
    });

    // Add to team activity feed
    team.activityFeed.unshift({
        user: req.user._id,
        message: `created a new challenge: ${title}`,
        type: 'CHALLENGE_CREATED'
    });
    await team.save();

    res.status(201).json(challenge);
});

module.exports = {
    createChallenge
};
