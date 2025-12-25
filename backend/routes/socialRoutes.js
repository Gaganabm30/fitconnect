const express = require('express');
const router = express.Router();
const { addFriend, getLeaderboard } = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

router.post('/friends/:id', protect, addFriend);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
