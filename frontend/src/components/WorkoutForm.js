import React, { useState } from 'react';
import api from '../services/api';

const WorkoutForm = ({ onWorkoutAdded }) => {
    const [type, setType] = useState('');
    const [intensity, setIntensity] = useState('Medium');
    const [duration, setDuration] = useState('');
    const [calories, setCalories] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!type || !duration || !calories) return;

        try {
            await api.post('/workouts', {
                type,
                intensity,
                duration: Number(duration),
                calories: Number(calories),
                date: new Date(date)
            });
            setType('');
            setIntensity('Medium');
            setDuration('');
            setCalories('');
            setDate(new Date().toISOString().split('T')[0]);
            if (onWorkoutAdded) onWorkoutAdded();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="workout-form-container">
            <h3 className="section-title">Add New Workout</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value="">Select Type</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Strength">Strength</option>
                        <option value="Yoga">Yoga</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Intensity</label>
                    <select value={intensity} onChange={(e) => setIntensity(e.target.value)} required>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Duration (min)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required placeholder="e.g. 45" />
                </div>
                <div className="form-group">
                    <label>Calories</label>
                    <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} required placeholder="e.g. 300" />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <button type="submit" className="primary-btn">Add Workout</button>
            </form>

            <style>{`
                .workout-form-container h3 {
                    margin-bottom: 20px;
                    color: #fff;
                    font-size: 1.2rem;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #aaa;
                    font-size: 0.9rem;
                }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .form-group input:focus, .form-group select:focus {
                    border-color: #ff8e53;
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
                option {
                    background: #222;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default WorkoutForm;
