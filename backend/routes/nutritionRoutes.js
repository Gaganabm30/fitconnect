const express = require('express');
const router = express.Router();
const {
    getMeals,
    addMeal,
    deleteMeal,
    estimateCalories,
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMeals).post(protect, addMeal);
router.route('/estimate').post(protect, estimateCalories);
router.route('/:id').delete(protect, deleteMeal);

module.exports = router;
