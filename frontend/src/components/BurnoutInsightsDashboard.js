import React, { useEffect, useState } from 'react';
import burnoutService from '../services/burnoutService';
import './BurnoutInsightsDashboard.css';

const BurnoutInsightsDashboard = () => {
    const [burnoutData, setBurnoutData] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, you'd get the token from your AuthContext/Storage
                const token = localStorage.getItem('token');

                // Trigger evaluation to get fresh data
                const data = await burnoutService.evaluateBurnout(token);
                setBurnoutData(data);

                const recs = await burnoutService.getRecommendations(token);
                setRecommendations(recs);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching burnout insights:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFeedback = async (type) => {
        try {
            await burnoutService.sendFeedback(type);
            alert("Thanks for your feedback! We'll use this to improve our insights.");
        } catch (error) {
            console.error("Error sending feedback:", error);
        }
    };

    if (loading) return <div className="burnout-loading">Analyzing your activity patterns...</div>;

    // If no data, show a placeholder instead of nothing
    if (!burnoutData) return (
        <div className="burnout-dashboard-container">
            <div className="burnout-header">
                <h2>Burnout Insights</h2>
            </div>
            <p style={{ color: '#888', textAlign: 'center' }}>
                Start working out to see your burnout analysis!
            </p>
        </div>
    );

    const getStatusColor = (level) => {
        switch (level) {
            case 'High Risk': return '#FF4D4D'; // Red
            case 'Moderate Risk': return '#FFC107'; // Yellow
            case 'Low Risk': return '#4CAF50'; // Green
            default: return '#ccc';
        }
    };

    const statusColor = getStatusColor(burnoutData.burnoutLevel);

    return (
        <div className="burnout-dashboard-container">
            <div className="burnout-header">
                <h2>Burnout Insights</h2>
                <div className="status-badge" style={{ backgroundColor: statusColor }}>
                    {burnoutData.burnoutLevel}
                </div>
            </div>

            <div className="burnout-stats-grid">
                <div className="stat-card">
                    <h3>7-Day Workouts</h3>
                    <p className="stat-value">{burnoutData.weeklyWorkoutCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Rest Days</h3>
                    <p className="stat-value">{burnoutData.restDays}</p>
                </div>
                <div className="stat-card">
                    <h3>Consistency</h3>
                    <p className="stat-value">{burnoutData.consistencyScore}%</p>
                </div>
            </div>

            {recommendations && (
                <div className="recommendations-card">
                    <h3>Recovery Recommendations</h3>
                    <ul className="rec-list">
                        {recommendations.suggestedActions.map((action, idx) => (
                            <li key={idx} className="rec-item">
                                <span className="rec-bullet">•</span> {action}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="feedback-section">
                <p>How do you feel today?</p>
                <div className="feedback-buttons">
                    <button className="feedback-btn good" onClick={() => handleFeedback('good')}>
                        🔋 Feeling Good
                    </button>
                    <button className="feedback-btn tired" onClick={() => handleFeedback('tired')}>
                        💤 Feeling Tired
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BurnoutInsightsDashboard;
