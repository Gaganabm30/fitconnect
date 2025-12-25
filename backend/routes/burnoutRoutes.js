const express = require('express');
const router = express.Router();
const {
    getBurnoutStatus,
    evaluateBurnout,
    getRecommendations,
    handleFeedback,
} = require('../controllers/burnoutController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', protect, getBurnoutStatus);
router.post('/evaluate', protect, evaluateBurnout);
router.get('/recommendations', protect, getRecommendations);
router.post('/feedback', protect, handleFeedback);

module.exports = router;
