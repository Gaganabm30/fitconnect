const express = require('express');
const router = express.Router();
const { updateUserProfile, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').put(protect, updateUserProfile);
router.route('/').get(protect, getUsers);

module.exports = router;
