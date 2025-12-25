const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTeam, joinTeam, getMyTeam, leaveTeam, sendMessage } = require('../controllers/teamController');

router.post('/', protect, createTeam);
router.post('/join', protect, joinTeam);
router.post('/leave', protect, leaveTeam);
router.get('/myteam', protect, getMyTeam);
router.post('/chat', protect, sendMessage);

module.exports = router;
