const asyncHandler = require('express-async-handler');
const Nutrition = require('../models/Nutrition');
const FoodLog = require('../models/FoodLog');
const OpenAI = require('openai');

// Remove top-level init
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 
// We will init inside the function to prevent startup crashes if key is missing

// @desc    Get meals
// @route   GET /api/nutrition
// @access  Private
const getMeals = asyncHandler(async (req, res) => {
    const meals = await Nutrition.find({ user: req.user.id });
    res.status(200).json(meals);
});

// @desc    Add meal
// @route   POST /api/nutrition
// @access  Private
const addMeal = asyncHandler(async (req, res) => {
    const { mealType, foodName, calories, protein, carbs, fat, date } = req.body;

    if (!mealType || !foodName || !calories) {
        res.status(400);
        throw new Error('Please add required fields');
    }

    const meal = await Nutrition.create({
        user: req.user.id,
        mealType,
        foodName,
        calories,
        protein,
        carbs,
        fat,
        date: date || Date.now(),
    });

    res.status(200).json(meal);
});

// @desc    Delete meal
// @route   DELETE /api/nutrition/:id
// @access  Private
const deleteMeal = asyncHandler(async (req, res) => {
    const meal = await Nutrition.findById(req.params.id);

    if (!meal) {
        res.status(400);
        throw new Error('Meal not found');
    }

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    if (meal.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await meal.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Estimate calories from natural language
// @route   POST /api/nutrition/estimate
// @access  Private
const estimateCalories = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query) {
        res.status(400);
        throw new Error('Please provide a food description');
    }

    let aiResponse;

    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('API Key missing');
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        console.log(`Estimating calories for query: "${query}"`);

        const prompt = `
        Analyze the following food description: "${query}"
        Identify food items, quantity, and estimate EXAT calories for each (single number, no ranges).
        Also provide a total estimated calorie count (single number).
        
        The response MUST be valid JSON in the following format (do not wrap in markdown code blocks, just raw JSON):
        {
            "parsedFood": [
                { "foodName": "Food Name", "quantity": "Quantity", "calories": 120, "confidence": "Medium" }
            ],
            "totalCalories": 500,
            "confidence": "Medium",
            "explanation": "Brief explanation..."
        }
        
        Consider Indian foods and common household measures (bowl, cup, plate).
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful nutrition assistant." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const responseText = completion.choices[0].message.content.trim();
        const jsonString = responseText.replace(/^```json\n/, '').replace(/\n```$/, '');

        aiResponse = JSON.parse(jsonString);

    } catch (error) {
        console.error('AI Estimation Warning (Switching to Fallback):', error.message);

        // Fallback Logic (Rule-based)
        const lowerQuery = query.toLowerCase();
        let parsedFood = [];
        let totalCalories = 0;

        const foodDatabase = {
            'chapati': 104, 'roti': 104, 'naan': 260, 'paratha': 260,
            'dal': 150, 'sambar': 130, 'curry': 170, 'paneer': 200,
            'rice': 130, 'biryani': 290, 'pulao': 200,
            'dosa': 170, 'idli': 60, 'vada': 150, 'upma': 190,
            'tea': 40, 'coffee': 60, 'milk': 120,
            'egg': 70, 'omelette': 150, 'sandwich': 250,
            'salad': 100, 'soup': 80, 'pizza': 285, 'burger': 350
        };

        // Re-implementing a slightly smarter fallback loop
        let i = 0;
        const words = lowerQuery.split(/[\s,]+/);
        while (i < words.length) {
            let qty = 1;
            let currentWord = words[i];

            if (!isNaN(currentWord) && parseFloat(currentWord) > 0) { // Ensure it's a positive number
                qty = parseFloat(currentWord);
                i++;
                if (i < words.length) currentWord = words[i];
                else { // Number at the end of query, can't be a quantity for a food
                    qty = 1; // Reset qty if no food follows
                    currentWord = words[i - 1]; // Revert to the number itself if no food follows
                }
            }

            const baseWord = currentWord.replace(/s$/, ''); // Handle plurals
            if (foodDatabase[baseWord]) {
                const cals = foodDatabase[baseWord] * qty;
                parsedFood.push({
                    foodName: currentWord.charAt(0).toUpperCase() + currentWord.slice(1),
                    quantity: `${qty} serving(s)`,
                    calories: cals,
                    confidence: 'Low'
                });
                totalCalories += cals;
            }
            i++;
        }

        if (parsedFood.length === 0) {
            // Failed to find anything
            res.status(500);
            throw new Error('Could not identify food items. Please check API Key or try standard foods.');
        }

        aiResponse = {
            parsedFood,
            totalCalories,
            confidence: 'Low (Offline Mode)',
            explanation: 'Estimated using offline database because AI service was unavailable.'
        };
    }

    // Save to FoodLog
    const foodLog = await FoodLog.create({
        user: req.user.id,
        inputQuery: query,
        parsedFood: aiResponse.parsedFood,
        totalCalories: String(aiResponse.totalCalories), // Ensure string for consistency with schema
        confidence: aiResponse.confidence,
        explanation: aiResponse.explanation
    });

    res.status(200).json(foodLog);
});

module.exports = {
    getMeals,
    addMeal,
    deleteMeal,
    estimateCalories,
};
