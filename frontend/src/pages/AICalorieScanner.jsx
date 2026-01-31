import React, { useState } from 'react';
import api from '../services/api';
import '../styles/AICalorieScanner.css'; // Assuming we will create this CSS file

const AICalorieScanner = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null);

    const handleEstimate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        setSaveStatus(null);

        try {
            const response = await api.post('/nutrition/estimate', { query });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to estimate calories');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Logic to save individual items to the daily log if needed
        // For now, we just acknowledge the user as the backend estimate call already logged it to FoodLog
        // If we want to add to the main Nutrition log (for daily tracking), we would iterate and call addMeal
        // But per requirements "Save to daily log button", let's implement that.

        if (!result || !result.parsedFood) return;

        setLoading(true);
        try {
            const promises = result.parsedFood.map(item => {
                // Determine calories (if range vs number) - now optimized for number
                let calVal = 0;
                if (typeof item.calories === 'string' && item.calories.includes('-')) {
                    const [min, max] = item.calories.split('-').map(Number);
                    calVal = (min + max) / 2;
                } else {
                    calVal = Number(item.calories) || 0;
                }

                return api.post('/nutrition', {
                    mealType: 'Snack', // Defaulting to Snack, ideally user selects
                    foodName: item.foodName,
                    calories: calVal,
                    protein: 0, // AI didn't return macros, so 0
                    carbs: 0,
                    fat: 0
                });
            });

            await Promise.all(promises);
            setSaveStatus('Successfully saved to daily log!');
        } catch (err) {
            console.error(err);
            setError('Failed to save to daily log');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-scanner-container">
            <h1>Calories Scanner</h1>
            <p>Type what you ate (e.g., "2 chapatis and dal")</p>

            <form onSubmit={handleEstimate} className="scanner-form">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter food description..."
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Estimating...' : 'Estimate Calories'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {result && (
                <div className="results-container">
                    <div className="summary-card">
                        <h2>Total Estimated Calories: {result.totalCalories}</h2>
                        <span className={`confidence-badge ${result.confidence.toLowerCase()}`}>
                            Confidence: {result.confidence}
                        </span>
                        <p className="explanation">{result.explanation}</p>
                    </div>

                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Food Item</th>
                                <th>Quantity</th>
                                <th>Calories</th>
                                <th>Fitness Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.parsedFood.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.foodName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.calories} kcal</td>
                                    <td>
                                        <span className={`impact-badge ${item.fitnessImpact?.toLowerCase() || 'medium'}`}>
                                            {item.fitnessImpact || 'Medium'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button className="save-button" onClick={handleSave} disabled={loading || saveStatus}>
                        {saveStatus ? saveStatus : 'Save to Daily Log'}
                    </button>
                </div>
            )}

            <div className="healthy-recommendations">
                <h3>🥗 Top Healthy Recommendations for Growth</h3>
                <div className="recommendations-grid">
                    <div className="rec-card">
                        <h4>Oats & Berries</h4>
                        <p>High fiber, sustained energy. Great for breakfast.</p>
                        <span className="impact-badge high">High Impact</span>
                    </div>
                    <div className="rec-card">
                        <h4>Grilled Chicken / Paneer</h4>
                        <p>Essential protein for muscle repair and growth.</p>
                        <span className="impact-badge high">High Impact</span>
                    </div>
                    <div className="rec-card">
                        <h4>Almonds & Walnuts</h4>
                        <p>Healthy fats for brain and joint health.</p>
                        <span className="impact-badge high">High Impact</span>
                    </div>
                    <div className="rec-card">
                        <h4>Spinach & Dal</h4>
                        <p>Iron and protein combo for recovery.</p>
                        <span className="impact-badge high">High Impact</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICalorieScanner;
