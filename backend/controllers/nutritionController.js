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
        Crucially, assess the "Fitness Impact" of each item (High, Medium, Low) - meaning how good it is for muscle growth/health.
        
        The response MUST be valid JSON in the following format (do not wrap in markdown code blocks, just raw JSON):
        {
            "parsedFood": [
                { "foodName": "Food Name", "quantity": "Quantity", "calories": 120, "confidence": "Medium", "fitnessImpact": "High" }
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
            // FAQ / Staples
            'chapati': { cal: 104, impact: 'Medium' }, 'roti': { cal: 104, impact: 'Medium' }, 'fulka': { cal: 80, impact: 'Medium' }, 'naan': { cal: 260, impact: 'Low' }, 'butter naan': { cal: 300, impact: 'Low' }, 'paratha': { cal: 260, impact: 'Medium' }, 'aloo paratha': { cal: 320, impact: 'Medium' }, 'paneer paratha': { cal: 350, impact: 'High' },
            'dal': { cal: 150, impact: 'High' }, 'dal tadka': { cal: 180, impact: 'High' }, 'dal makhani': { cal: 280, impact: 'Medium' }, 'sambar': { cal: 130, impact: 'High' }, 'rasam': { cal: 80, impact: 'High' },
            'rice': { cal: 130, impact: 'Medium' }, 'steamed rice': { cal: 130, impact: 'Medium' }, 'fried rice': { cal: 250, impact: 'Low' }, 'jeera rice': { cal: 180, impact: 'Medium' }, 'biryani': { cal: 290, impact: 'Medium' }, 'chicken biryani': { cal: 350, impact: 'High' }, 'veg biryani': { cal: 280, impact: 'Medium' }, 'pulao': { cal: 200, impact: 'Medium' }, 'curd rice': { cal: 210, impact: 'High' },
            'curry': { cal: 170, impact: 'Medium' }, 'veg curry': { cal: 170, impact: 'High' }, 'chicken curry': { cal: 250, impact: 'High' }, 'fish curry': { cal: 220, impact: 'High' }, 'paneer butter masala': { cal: 350, impact: 'High' }, 'chole': { cal: 220, impact: 'High' }, 'rajma': { cal: 200, impact: 'High' },
            // Generic Basics (Fallbacks for single words)
            'chicken': { cal: 220, impact: 'High' }, 'paneer': { cal: 265, impact: 'High' }, 'egg': { cal: 70, impact: 'High' }, 'fish': { cal: 200, impact: 'High' }, 'mutton': { cal: 294, impact: 'High' },

            // Indian Breakfast
            'dosa': { cal: 170, impact: 'Medium' }, 'masala dosa': { cal: 350, impact: 'Medium' }, 'idli': { cal: 60, impact: 'High' }, 'vada': { cal: 150, impact: 'Low' }, 'medu vada': { cal: 150, impact: 'Low' }, 'sambar vada': { cal: 200, impact: 'Medium' },
            'upma': { cal: 190, impact: 'Medium' }, 'poha': { cal: 180, impact: 'High' }, 'pongal': { cal: 220, impact: 'Medium' }, 'puri': { cal: 140, impact: 'Low' }, 'bhatura': { cal: 280, impact: 'Low' },

            // Junk / Street Food
            'pani puri': { cal: 50, impact: 'Low' }, 'golgappa': { cal: 50, impact: 'Low' }, 'samosa': { cal: 260, impact: 'Low' }, 'kachori': { cal: 280, impact: 'Low' }, 'vada pav': { cal: 290, impact: 'Low' }, 'pav bhaji': { cal: 400, impact: 'Low' }, 'bhel puri': { cal: 200, impact: 'Medium' }, 'sev puri': { cal: 250, impact: 'Low' }, 'papdi chaat': { cal: 250, impact: 'Low' },
            'momos': { cal: 35, impact: 'Low' }, 'veg momos': { cal: 35, impact: 'Low' }, 'chicken momos': { cal: 50, impact: 'Medium' }, 'spring roll': { cal: 150, impact: 'Low' },
            'noodles': { cal: 350, impact: 'Low' }, 'chowmein': { cal: 380, impact: 'Low' }, 'hakka noodles': { cal: 350, impact: 'Low' }, 'manchurian': { cal: 250, impact: 'Low' }, 'gobi manchurian': { cal: 280, impact: 'Low' }, 'chilli potato': { cal: 300, impact: 'Low' },
            'maggi': { cal: 210, impact: 'Low' }, 'pasta': { cal: 250, impact: 'Low' }, 'macaroni': { cal: 250, impact: 'Low' },
            'pizza': { cal: 285, impact: 'Low' }, 'burger': { cal: 350, impact: 'Low' }, 'fries': { cal: 312, impact: 'Low' }, 'french fries': { cal: 312, impact: 'Low' }, 'sandwich': { cal: 250, impact: 'Medium' }, 'grilled sandwich': { cal: 300, impact: 'Medium' },
            'chips': { cal: 150, impact: 'Low' }, 'nachos': { cal: 300, impact: 'Low' }, 'popcorn': { cal: 100, impact: 'Medium' }, 'biscuits': { cal: 40, impact: 'Low' }, 'cookie': { cal: 50, impact: 'Low' }, 'rusk': { cal: 40, impact: 'Low' },

            // Dry Fruits & Nuts
            'almonds': { cal: 7, impact: 'High' }, 'badam': { cal: 7, impact: 'High' },
            'cashews': { cal: 10, impact: 'High' }, 'kaju': { cal: 10, impact: 'High' },
            'walnuts': { cal: 26, impact: 'High' }, 'akhrot': { cal: 26, impact: 'High' },
            'raisins': { cal: 2, impact: 'Medium' }, 'kishmish': { cal: 2, impact: 'Medium' },
            'dates': { cal: 25, impact: 'High' }, 'khajoor': { cal: 25, impact: 'High' },
            'pista': { cal: 4, impact: 'High' },
            'fig': { cal: 47, impact: 'High' }, 'anjeer': { cal: 47, impact: 'High' },
            'peanuts': { cal: 160, impact: 'High' }, 'groundnuts': { cal: 160, impact: 'High' },

            // Healthy / Breakfast
            'oats': { cal: 150, impact: 'High' }, 'oatmeal': { cal: 150, impact: 'High' }, 'cornflakes': { cal: 180, impact: 'Medium' }, 'muesli': { cal: 200, impact: 'High' }, 'quinoa': { cal: 120, impact: 'High' },
            'bread': { cal: 70, impact: 'Medium' }, 'toast': { cal: 70, impact: 'Medium' }, 'brown bread': { cal: 65, impact: 'High' }, 'butter': { cal: 100, impact: 'Medium' }, 'cheese': { cal: 113, impact: 'Medium' }, 'jam': { cal: 50, impact: 'Low' },
            'boiled egg': { cal: 70, impact: 'High' }, 'omelette': { cal: 150, impact: 'High' }, 'bhurji': { cal: 180, impact: 'High' },
            'salad': { cal: 100, impact: 'High' }, 'soup': { cal: 80, impact: 'High' }, 'sprouts': { cal: 60, impact: 'High' },

            // Drinks
            'tea': { cal: 40, impact: 'Medium' }, 'chai': { cal: 40, impact: 'Medium' }, 'coffee': { cal: 60, impact: 'Medium' }, 'milk': { cal: 120, impact: 'High' }, 'curd': { cal: 100, impact: 'High' }, 'yogurt': { cal: 100, impact: 'High' }, 'lassi': { cal: 200, impact: 'Medium' }, 'buttermilk': { cal: 40, impact: 'High' }, 'chaas': { cal: 40, impact: 'High' },
            'coke': { cal: 140, impact: 'Low' }, 'pepsi': { cal: 140, impact: 'Low' }, 'sprite': { cal: 140, impact: 'Low' }, 'soda': { cal: 140, impact: 'Low' }, 'cold drink': { cal: 140, impact: 'Low' }, 'juice': { cal: 120, impact: 'Medium' }, 'orange juice': { cal: 110, impact: 'High' }, 'apple juice': { cal: 115, impact: 'High' },
            'beer': { cal: 150, impact: 'Low' }, 'wine': { cal: 125, impact: 'Low' }, 'whiskey': { cal: 105, impact: 'Low' }, 'vodka': { cal: 97, impact: 'Low' }, 'water': { cal: 0, impact: 'High' }, 'coconut water': { cal: 40, impact: 'High' },

            // Sweets / Desserts
            'gulab jamun': { cal: 150, impact: 'Low' }, 'rasgulla': { cal: 125, impact: 'Low' }, 'jalebi': { cal: 150, impact: 'Low' }, 'laddu': { cal: 200, impact: 'Low' }, 'barfi': { cal: 150, impact: 'Low' }, 'halwa': { cal: 300, impact: 'Low' }, 'kheer': { cal: 250, impact: 'Medium' },
            'ice cream': { cal: 200, impact: 'Low' }, 'chocolate': { cal: 250, impact: 'Low' }, 'cake': { cal: 250, impact: 'Low' }, 'pastry': { cal: 300, impact: 'Low' }, 'brownie': { cal: 350, impact: 'Low' },

            // Fruits & Veg
            'apple': { cal: 95, impact: 'High' }, 'banana': { cal: 105, impact: 'High' }, 'mango': { cal: 150, impact: 'High' }, 'orange': { cal: 60, impact: 'High' }, 'grapes': { cal: 70, impact: 'High' }, 'papaya': { cal: 60, impact: 'High' }, 'watermelon': { cal: 50, impact: 'High' },
            'potato': { cal: 110, impact: 'Medium' }, 'onion': { cal: 40, impact: 'High' }, 'tomato': { cal: 20, impact: 'High' }, 'cucumber': { cal: 16, impact: 'High' },
        };

        // Re-implementing a slightly smarter fallback loop
        let i = 0;
        const words = lowerQuery.split(/[\s,]+/);
        while (i < words.length) {
            let qty = 1;
            let currentWord = words[i];

            // Handle multipliers like "2" or "3"
            if (!isNaN(currentWord) && parseFloat(currentWord) > 0) {
                qty = parseFloat(currentWord);
                i++;
                if (i < words.length) currentWord = words[i];
                else {
                    qty = 1;
                    currentWord = words[i - 1];
                }
            }

            const baseWord = currentWord.replace(/s$/, ''); // Handle plurals basic

            // Try explicit match first
            let match = foodDatabase[currentWord] || foodDatabase[baseWord];

            // Try multi-word match (e.g. "pani puri", "masala dosa")
            if (!match && i + 1 < words.length) {
                const nextWord = words[i + 1].replace(/s$/, '');
                const twoWords = `${baseWord} ${nextWord}`;
                if (foodDatabase[twoWords]) {
                    match = foodDatabase[twoWords];
                    currentWord = twoWords;
                    i++; // consume next word
                }
            }

            if (match) {
                const cals = match.cal * qty;
                parsedFood.push({
                    foodName: currentWord.charAt(0).toUpperCase() + currentWord.slice(1),
                    quantity: `${qty} serving(s)/piece(s)`,
                    calories: cals,
                    confidence: 'Low (Offline Estimate)',
                    fitnessImpact: match.impact
                });
                totalCalories += cals;
            }
            i++;
        }

        if (parsedFood.length === 0) {
            // Failed to find anything
            res.status(500);
            throw new Error('Could not identify food items. Please check API Key or try standard foods like "Chicken", "Paneer", "Rice".');
        }

        const quotes = [
            "Fuel your body, feed your soul.",
            "Eat like you love yourself.",
            "Every healthy meal is a step towards a better you.",
            "Nourish to flourish.",
            "You are what you eat, so don't be fast, cheap, easy, or fake.",
            "Your body is a temple, keep it clean and prolonged.",
            "Healthy eating is a form of self-respect."
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        aiResponse = {
            parsedFood,
            totalCalories,
            confidence: 'Low (Offline Mode)',
            explanation: `💡 Motivation: ${randomQuote}`
        };
    }

    // AI Path - Inject Quote if not in Offline Mode (Fallback already does it)
    if (aiResponse && !aiResponse.confidence.includes('Offline')) {
        const quotes = [
            "Fuel your body, feed your soul.",
            "Eat like you love yourself.",
            "Every healthy meal is a step towards a better you.",
            "Nourish to flourish.",
            "You are what you eat, so don't be fast, cheap, easy, or fake."
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // Append quote to explanation if it exists
        if (aiResponse.explanation) {
            aiResponse.explanation += `\n\n💡 Motivation: ${randomQuote}`;
        } else {
            aiResponse.explanation = `💡 Motivation: ${randomQuote}`;
        }
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
