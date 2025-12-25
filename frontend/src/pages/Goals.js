import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaBullseye, FaTrash, FaPlusCircle, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [type, setType] = useState('Weight');
    const [targetValue, setTargetValue] = useState('');
    const [deadline, setDeadline] = useState('');

    const quotes = [
        "\"Cheating on your health is cheating yourself.\"",
        "\"Integrity is doing the right thing, even when no one is watching.\"",
        "\"You can't cheat the grind.\"",
        "\"Honesty is the first chapter in the book of wisdom.\"",
        "\"Be true to your future self.\""
    ];

    const fetchGoals = async () => {
        try {
            const { data } = await api.get('/goals');
            setGoals(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/goals', {
                type,
                targetValue: Number(targetValue),
                deadline
            });
            setTargetValue('');
            setDeadline('');
            fetchGoals();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/goals/${id}`);
            setGoals(goals.filter(g => g._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStatus = async (goal) => {
        const newStatus = goal.status === 'Achieved' ? 'In Progress' : 'Achieved';
        try {
            // Optimistic update
            setGoals(goals.map(g => g._id === goal._id ? { ...g, status: newStatus } : g));
            await api.put(`/goals/${goal._id}`, { status: newStatus });
        } catch (error) {
            console.error(error);
            fetchGoals(); // Revert on error
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Fitness Goals <FaBullseye style={{ fontSize: '0.8em', verticalAlign: 'middle', color: '#ff6b6b' }} /></h1>

            <div className="goals-grid">
                {/* Form Section */}
                <div className="glass-card form-section">
                    <h3 className="section-title"><FaPlusCircle /> Set New Goal</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Goal Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="Weight">Weight (kg)</option>
                                <option value="Steps">Daily Steps</option>
                                <option value="Workout Frequency">Workouts per Week</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Target Value</label>
                            <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="e.g. 70" required />
                        </div>
                        <div className="input-group">
                            <label>Deadline</label>
                            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ colorScheme: 'dark' }} />
                        </div>
                        <button type="submit" className="primary-btn">Create Goal</button>
                    </form>
                </div>

                {/* Goals List Section */}
                <div className="goals-list-section">
                    <h2 className="section-title">Your Active Goals</h2>
                    <div className="goals-container">
                        {goals.length > 0 ? (
                            goals.map((goal, index) => {
                                const isAchieved = goal.status === 'Achieved';
                                return (
                                    <div key={goal._id} className="glass-card goal-card" style={{ borderColor: isAchieved ? '#2ecc71' : 'rgba(255,255,255,0.1)' }}>
                                        <div className="goal-header">
                                            <div className="goal-icon" style={{ background: isAchieved ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                                                {goal.type === 'Weight' ? '⚖️' : goal.type === 'Steps' ? '👣' : '💪'}
                                            </div>
                                            <div className="goal-info">
                                                <h3>{goal.type} {isAchieved && <span style={{ fontSize: '0.8em', color: '#2ecc71' }}>✓ Achieved</span>}</h3>
                                                <p className="goal-meta">Target: <span>{goal.targetValue} {goal.type === 'Weight' ? 'kg' : ''}</span></p>
                                                {goal.deadline && <p className="goal-date">Due: {new Date(goal.deadline).toLocaleDateString()}</p>}
                                            </div>
                                            <button onClick={() => handleDelete(goal._id)} className="delete-icon-btn"><FaTrash /></button>
                                        </div>

                                        <div className="goal-actions" style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                            <div
                                                onClick={() => toggleStatus(goal)}
                                                className="status-toggle-btn"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    cursor: 'pointer',
                                                    color: isAchieved ? '#2ecc71' : '#aaa'
                                                }}
                                            >
                                                {isAchieved ? <FaCheckCircle size={20} /> : <FaRegCircle size={20} />}
                                                <span>{isAchieved ? 'Goal Achieved!' : 'Mark as Achieved'}</span>
                                            </div>

                                            <p className="honesty-quote" style={{
                                                marginTop: '10px',
                                                fontSize: '0.85rem',
                                                fontStyle: 'italic',
                                                color: '#666',
                                                borderLeft: '2px solid #ff6b6b',
                                                paddingLeft: '10px'
                                            }}>
                                                {quotes[index % quotes.length]}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <p>No goals set yet. Start by creating one!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .page-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    background: linear-gradient(to right, #fff, #ccc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .goals-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 30px;
                }

                .glass-card {
                    background: rgba(30, 30, 30, 0.6);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 25px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .glass-card:hover {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }

                .section-title {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: #ddd;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* Form Styles */
                .input-group {
                    margin-bottom: 20px;
                }

                .input-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #aaa;
                    font-size: 0.9rem;
                }

                .input-group input, .input-group select {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    outline: none;
                    transition: border-color 0.3s;
                }

                .input-group input:focus, .input-group select:focus {
                    border-color: #ff6b6b;
                }

                .primary-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(45deg, #ff6b6b, #ff8e53);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .primary-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
                }

                /* Goal Card Styles */
                .goal-card {
                    margin-bottom: 20px;
                    position: relative;
                }

                .goal-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .goal-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .goal-icon {
                    font-size: 2rem;
                    background: rgba(255,255,255,0.05);
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }

                .goal-info h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #fff;
                }

                .goal-meta {
                    margin: 5px 0 0;
                    color: #aaa;
                    font-size: 0.9rem;
                }
                .goal-meta span {
                    color: #fff;
                    font-weight: 500;
                }
                
                .goal-date {
                    margin: 2px 0 0;
                    font-size: 0.8rem;
                    color: #666;
                }

                .delete-icon-btn {
                    margin-left: auto;
                    background: transparent;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: color 0.2s;
                    padding: 5px;
                }

                .delete-icon-btn:hover {
                    color: #ff4757;
                }

                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: #aaa;
                    margin-bottom: 8px;
                }

                .progress-bar-bg {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 1s ease;
                }

                .empty-state {
                    text-align: center;
                    color: #666;
                    padding: 40px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 20px;
                }

                @media (max-width: 900px) {
                    .goals-grid {
                        grid-template-columns: 1fr;
                    }
                }
                option {
                    background: #222;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default Goals;
