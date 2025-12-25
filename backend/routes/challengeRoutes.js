const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createChallenge } = require('../controllers/challengeController');

router.post('/', protect, createChallenge);

module.exports = router;
