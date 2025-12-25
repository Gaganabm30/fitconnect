const express = require('express');
const router = express.Router();
const {
    getWorkouts,
    setWorkout,
    updateWorkout,
    deleteWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWorkouts).post(protect, setWorkout);
router.route('/:id').delete(protect, deleteWorkout).put(protect, updateWorkout);

module.exports = router;
