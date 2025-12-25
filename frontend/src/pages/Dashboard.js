import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaFire, FaDumbbell, FaHeartbeat, FaBell, FaSearch, FaRobot, FaCheckCircle, FaRegCircle, FaHourglassHalf } from 'react-icons/fa';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import './DashboardLayout.css';
import BurnoutInsightsDashboard from '../components/BurnoutInsightsDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        caloriesBurned: 0,
        workoutsCount: 0,
        heartRate: 75,
        activeMinutes: 0
    });
    const [goals, setGoals] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [loading, setLoading] = useState(true);

    // AI Coach State
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiRec, setAiRec] = useState(null);
    const [aiProfile, setAiProfile] = useState({
        age: '',
        height: '',
        weight: '',
        gender: 'Male',
        goal: 'Weight Loss',
        fitnessLevel: 'Intermediate' // Default
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workoutsRes, goalsRes, aiRes] = await Promise.all([
                    api.get('/workouts'),
                    api.get('/goals'),
                    api.get('/ai/recommendations').catch(() => ({ data: null }))
                ]);

                const workouts = workoutsRes.data;
                const fetchedGoals = goalsRes.data;
                if (aiRes.data) setAiRec(aiRes.data);

                // Calculate User Stats & Trends
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

                const currentMonthWorkouts = workouts.filter(w => {
                    const d = new Date(w.date || w.createdAt);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });

                const lastMonthWorkouts = workouts.filter(w => {
                    const d = new Date(w.date || w.createdAt);
                    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
                });

                const calculateTrend = (current, previous) => {
                    if (previous === 0) return current > 0 ? 100 : 0;
                    return Math.round(((current - previous) / previous) * 100);
                };

                // Current Stats
                const totalCalories = currentMonthWorkouts.reduce((acc, curr) => acc + (curr.calories || 0), 0);
                const totalMinutes = currentMonthWorkouts.reduce((acc, curr) => acc + (curr.duration || 0), 0);

                // Previous Stats
                const prevCalories = lastMonthWorkouts.reduce((acc, curr) => acc + (curr.calories || 0), 0);
                const prevMinutes = lastMonthWorkouts.reduce((acc, curr) => acc + (curr.duration || 0), 0);

                setStats({
                    caloriesBurned: totalCalories,
                    workoutsCount: currentMonthWorkouts.length,
                    activeMinutes: totalMinutes,
                    trends: {
                        workouts: calculateTrend(currentMonthWorkouts.length, lastMonthWorkouts.length),
                        calories: calculateTrend(totalCalories, prevCalories),
                        minutes: calculateTrend(totalMinutes, prevMinutes)
                    }
                });

                setGoals(fetchedGoals);

                // Calculate Activity Data (Last 7 Days)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });

                const formattedData = last7Days.map(date => {
                    const dateString = date.toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    const dayWorkouts = workouts.filter(w => {
                        const wDateStr = w.date || w.createdAt;
                        if (!wDateStr) return false;
                        const wDateIso = new Date(wDateStr).toISOString().split('T')[0];
                        return wDateIso === dateString;
                    });

                    const minutes = dayWorkouts.reduce((acc, curr) => acc + (curr.duration || 0), 0);
                    const calories = dayWorkouts.reduce((acc, curr) => acc + (curr.calories || 0), 0);

                    return {
                        name: dayName,
                        fullDate: dateString,
                        minutes: minutes,
                        calories: calories
                    };
                });

                setActivityData(formattedData);

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAIProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            // Ensure numbers are numbers
            const payload = {
                ...aiProfile,
                age: Number(aiProfile.age),
                height: Number(aiProfile.height),
                weight: Number(aiProfile.weight)
            };

            await api.post('/ai/profile', payload);
            const res = await api.get('/ai/recommendations');
            setAiRec(res.data);
        } catch (error) {
            console.error("Error updating AI profile", error);
            alert("Failed to generate plan. Please check all fields.");
        }
    };



    // Custom Tooltip for the Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(20, 20, 20, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}>
                    <p style={{ color: '#fff', margin: 0, fontWeight: 'bold' }}>{label}</p>
                    <p style={{ color: '#ff6b6b', margin: '5px 0 0' }}>
                        <FaHeartbeat style={{ display: 'inline', marginRight: '5px' }} />
                        {payload[0].value} mins
                    </p>
                    <p style={{ color: '#ff8e53', margin: '3px 0 0' }}>
                        <FaFire style={{ display: 'inline', marginRight: '5px' }} />
                        {payload[0].payload.calories} kcal
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <header className="dashboard-header-section">
                <div className="welcome-text">
                    <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
                    <p>Track, manage and forecast your fitness goals.</p>
                </div>
                <div className="ai-coach-widget" onClick={() => setShowAIModal(true)}>
                    <div className="ai-icon animated-pulse">
                        <FaRobot />
                    </div>
                    <div className="ai-text">
                        <span className="ai-label">AI Coach Insights</span>
                        <span className="ai-sub">
                            {aiRec ? `${aiRec.calories} kcal • ${aiRec.summary.substring(0, 30)}...` : "Tap to set up your plan"}
                        </span>
                    </div>
                </div>
            </header>

            {/* AI Modal */}
            {showAIModal && (
                <div className="modal-overlay" onClick={() => setShowAIModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <h2><FaRobot /> Your AI Coach</h2>

                        {!aiRec ? (
                            <form onSubmit={handleAIProfileUpdate} className="ai-form">
                                <h3>Let's get to know you</h3>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input type="number" onChange={e => setAiProfile({ ...aiProfile, age: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Height (cm)</label>
                                        <input type="number" onChange={e => setAiProfile({ ...aiProfile, height: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight (kg)</label>
                                        <input type="number" onChange={e => setAiProfile({ ...aiProfile, weight: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select onChange={e => setAiProfile({ ...aiProfile, gender: e.target.value })}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Fitness Level</label>
                                    <select onChange={e => setAiProfile({ ...aiProfile, fitnessLevel: e.target.value })}>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Goal</label>
                                    <select onChange={e => setAiProfile({ ...aiProfile, goal: e.target.value })}>
                                        <option value="Weight Loss">Weight Loss</option>
                                        <option value="Muscle Gain">Muscle Gain</option>
                                        <option value="Endurance">Endurance</option>
                                    </select>
                                </div>
                                <button type="submit" className="primary-btn">Generate Plan</button>
                            </form>
                        ) : (
                            <div className="ai-results">
                                <div className="ai-card highlight">
                                    <h3>Daily Targets</h3>
                                    <div className="ai-stats">
                                        <div>
                                            <strong>{aiRec.calories}</strong> <small>kcal</small>
                                        </div>
                                        <div>
                                            <strong>{aiRec.macros.protein}g</strong> <small>Protein</small>
                                        </div>
                                        <div>
                                            <strong>{aiRec.macros.carbs}g</strong> <small>Carbs</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="ai-card">
                                    <h3>Today's Workout</h3>
                                    <p>{aiRec.workout}</p>
                                </div>

                                <div className="ai-card">
                                    <h3>Coach's Tip</h3>
                                    <p>"{aiRec.tip}"</p>
                                </div>

                                <button onClick={() => setAiRec(null)} className="text-btn">Update Profile</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .ai-coach-widget {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: rgba(52, 152, 219, 0.1);
                    border: 1px solid rgba(52, 152, 219, 0.3);
                    padding: 10px 20px;
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .ai-coach-widget:hover {
                    background: rgba(52, 152, 219, 0.2);
                    transform: translateY(-2px);
                }
                .ai-icon {
                    font-size: 1.5rem;
                    color: #3498db;
                }
                .ai-text {
                    display: flex;
                    flex-direction: column;
                }
                .ai-label {
                    font-weight: bold;
                    color: white;
                    font-size: 0.9rem;
                }
                .ai-sub {
                    font-size: 0.8rem;
                    color: #aaa;
                }
                .animated-pulse {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    width: 90%;
                    max-width: 500px;
                    background: #1a1a1a;
                    padding: 30px;
                    border-radius: 20px;
                    border: 1px solid rgba(52, 152, 219, 0.3);
                }
                .modal-content h2 {
                    color: #3498db;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .ai-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .form-group label {
                    color: #aaa;
                    font-size: 0.9rem;
                }
                .form-group input, .form-group select {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 10px;
                    border-radius: 8px;
                    outline: none;
                }
                .form-group option {
                    background: #222;
                    color: white;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .ai-results {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .ai-stats {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                .ai-stats div {
                    text-align: center;
                }
                .ai-stats strong {
                    display: block;
                    font-size: 1.5rem;
                    color: white;
                }
                .ai-stats small {
                    color: #888;
                }
                .ai-card {
                    background: rgba(255,255,255,0.03);
                    padding: 15px;
                    border-radius: 10px;
                }
                .highlight {
                    border: 1px solid rgba(46, 204, 113, 0.3);
                    background: rgba(46, 204, 113, 0.05);
                }
                .text-btn {
                    background: none;
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                    text-decoration: underline;
                    margin-top: 10px;
                }
            `}</style>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="glass-card">
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Total Workouts</span>
                            <div className="stat-value">{stats.workoutsCount}</div>
                        </div>
                        <div className="stat-icon-box orange">
                            <FaDumbbell />
                        </div>
                    </div>
                    <div className={`stat-trend ${stats.trends?.workouts >= 0 ? 'trend-up' : 'trend-down'}`}>
                        <span>{stats.trends?.workouts >= 0 ? '↗' : '↘'} {Math.abs(stats.trends?.workouts || 0)}%</span>
                        <span style={{ color: '#888', marginLeft: '5px' }}>from last month</span>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Calories Burned</span>
                            <div className="stat-value">{stats.caloriesBurned}</div>
                        </div>
                        <div className="stat-icon-box blue">
                            <FaFire />
                        </div>
                    </div>
                    <div className={`stat-trend ${stats.trends?.calories >= 0 ? 'trend-up' : 'trend-down'}`}>
                        <span>{stats.trends?.calories >= 0 ? '↗' : '↘'} {Math.abs(stats.trends?.calories || 0)}%</span>
                        <span style={{ color: '#888', marginLeft: '5px' }}>from last month</span>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Active Minutes</span>
                            <div className="stat-value">{stats.activeMinutes}</div>
                        </div>
                        <div className="stat-icon-box green">
                            <FaHeartbeat />
                        </div>
                    </div>
                    <div className={`stat-trend ${stats.trends?.minutes >= 0 ? 'trend-up' : 'trend-down'}`}>
                        <span>{stats.trends?.minutes >= 0 ? '↗' : '↘'} {Math.abs(stats.trends?.minutes || 0)}%</span>
                        <span style={{ color: '#888', marginLeft: '5px' }}>from last month</span>
                    </div>
                </div>
            </div>

            {/* Main Widgets */}
            <div className="dashboard-widgets">
                <div className="glass-card widget-large">
                    <div className="widget-header">
                        <h3>Activity Statistics</h3>
                        <select style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>
                            <option>Last 7 days</option>
                        </select>
                    </div>

                    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={activityData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="minutes" radius={[5, 5, 0, 0]}>
                                    {activityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                                    ))}
                                </Bar>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ff6b6b" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#ff8e53" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="widget-header">
                        <h3>Upcoming Goals</h3>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        {goals.length > 0 ? (
                            goals.map((goal) => {
                                const isAchieved = goal.status === 'Achieved';
                                return (
                                    <div key={goal._id} style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{goal.type}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Target: {goal.targetValue}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isAchieved ? '#2ecc71' : '#f1c40f' }}>
                                            {isAchieved ? <FaCheckCircle /> : <FaHourglassHalf />}
                                            <span style={{ fontSize: '0.9rem' }}>{isAchieved ? 'Achieved' : 'In Progress'}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ color: '#888' }}>No upcoming goals.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Burnout Insights Section */}
            <BurnoutInsightsDashboard />

            <style>{`
                .ai-coach-widget {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: rgba(52, 152, 219, 0.1);
                    border: 1px solid rgba(52, 152, 219, 0.3);
                    padding: 10px 20px;
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .ai-coach-widget:hover {
                    background: rgba(52, 152, 219, 0.2);
                    transform: translateY(-2px);
                }
                .ai-icon {
                    font-size: 1.5rem;
                    color: #3498db;
                }
                .ai-text {
                    display: flex;
                    flex-direction: column;
                }
                .ai-label {
                    font-weight: bold;
                    color: white;
                    font-size: 0.9rem;
                }
                .ai-sub {
                    font-size: 0.8rem;
                    color: #aaa;
                }
                .animated-pulse {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    width: 90%;
                    max-width: 500px;
                    background: #1a1a1a;
                    padding: 30px;
                    border-radius: 20px;
                    border: 1px solid rgba(52, 152, 219, 0.3);
                }
                .modal-content h2 {
                    color: #3498db;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .ai-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .form-group label {
                    color: #aaa;
                    font-size: 0.9rem;
                }
                .form-group input, .form-group select {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 10px;
                    border-radius: 8px;
                    outline: none;
                }
                .form-group option {
                    background: #222;
                    color: white;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .ai-results {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .ai-stats {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                .ai-stats div {
                    text-align: center;
                }
                .ai-stats strong {
                    display: block;
                    font-size: 1.5rem;
                    color: white;
                }
                .ai-stats small {
                    color: #888;
                }
                .ai-card {
                    background: rgba(255,255,255,0.03);
                    padding: 15px;
                    border-radius: 10px;
                }
                .highlight {
                    border: 1px solid rgba(46, 204, 113, 0.3);
                    background: rgba(46, 204, 113, 0.05);
                }
                .text-btn {
                    background: none;
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                    text-decoration: underline;
                    margin-top: 10px;
                }
            `}</style>
        </>
    );
};

export default Dashboard;
