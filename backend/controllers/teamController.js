const Team = require('../models/Team');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const asyncHandler = require('express-async-handler');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Generate unique 6-char invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const team = await Team.create({
        name,
        description,
        admin: req.user._id,
        members: [req.user._id],
        inviteCode,
        activityFeed: [{
            user: req.user._id,
            message: 'created the team',
            type: 'JOIN'
        }]
    });

    // Update user's team reference (assuming User model will accept it, or we query by membership)
    // Ideally we might want to store teamId in User model for quick access, but querying by members array is fine for now

    res.status(201).json(team);
});

// @desc    Join a team by code
// @route   POST /api/teams/join
// @access  Private
const joinTeam = asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;

    const team = await Team.findOne({ inviteCode });

    if (team) {
        if (team.members.includes(req.user._id)) {
            res.status(400);
            throw new Error('User already in this team');
        }

        team.members.push(req.user._id);
        team.activityFeed.unshift({
            user: req.user._id,
            message: 'joined the team',
            type: 'JOIN'
        });

        await team.save();
        res.status(200).json(team);
    } else {
        res.status(404);
        throw new Error('Team not found');
    }
});

// @desc    Get user's team
// @route   GET /api/teams/myteam
// @access  Private
const getMyTeam = asyncHandler(async (req, res) => {
    // Find team where user is a member
    const team = await Team.findOne({ members: req.user._id })
        .populate('members', 'name email')
        .populate('activityFeed.user', 'name')
        .populate('chat.user', 'name'); // Populate Chat users

    if (!team) {
        // Return 204 No Content or null if no team found, handle on frontend
        return res.status(200).json(null);
    }

    // Also fetch active challenges for this team
    const challenges = await Challenge.find({ team: team._id, status: 'Active' });

    res.status(200).json({ team, challenges });
});

// @desc    Leave current team
// @route   POST /api/teams/leave
// @access  Private
const leaveTeam = asyncHandler(async (req, res) => {
    const team = await Team.findOne({ members: req.user._id });

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Remove user from members
    team.members = team.members.filter(member => member.toString() !== req.user._id.toString());

    // If no members left, delete team
    if (team.members.length === 0) {
        await team.deleteOne();
        return res.status(200).json({ message: 'Team deleted as last member left' });
    }

    // If admin leaves, assign new admin (simplistic: first remaining member)
    if (team.admin.toString() === req.user._id.toString()) {
        team.admin = team.members[0];
    }

    // Add explicit event
    team.activityFeed.unshift({
        user: req.user._id,
        message: 'left the team',
        type: 'JOIN'
    });

    await team.save();
    res.status(200).json({ message: 'Left team successfully' });
});

// @desc    Send a chat message
// @route   POST /api/teams/chat
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const team = await Team.findOne({ members: req.user._id });

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    team.chat.push({
        user: req.user._id,
        message
    });

    await team.save();

    // Return the newly added message populated
    const populatedTeam = await Team.findById(team._id).populate('chat.user', 'name');
    const newMessage = populatedTeam.chat[populatedTeam.chat.length - 1];

    res.status(200).json(newMessage);
});

module.exports = {
    createTeam,
    joinTeam,
    getMyTeam,
    leaveTeam,
    sendMessage
};
