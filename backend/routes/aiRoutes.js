const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateProfile, getRecommendations, getProfile } = require('../controllers/aiController');

router.route('/profile').post(protect, updateProfile).get(protect, getProfile);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
