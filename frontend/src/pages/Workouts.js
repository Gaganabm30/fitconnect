import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WorkoutForm from '../components/WorkoutForm';
import { FaRunning, FaFireAlt, FaRegCalendarAlt, FaTrash } from 'react-icons/fa';

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [todos, setTodos] = useState([
        { id: 1, text: 'Drink 3L Water', completed: false },
        { id: 2, text: 'Morning Stretch', completed: true },
    ]);
    const [newTodo, setNewTodo] = useState('');

    const fetchWorkouts = async () => {
        try {
            const { data } = await api.get('/workouts');
            setWorkouts(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchWorkouts();
        // Load todos from local storage if available (optional enhancement for later)
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/workouts/${id}`);
            setWorkouts(workouts.filter(w => w._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTodo = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
        setNewTodo('');
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Workout Tracker <FaRunning style={{ fontSize: '0.8em', verticalAlign: 'middle', color: '#ff8e53' }} /></h1>

            <div className="workouts-grid">
                {/* Left Column: Log Workout & Todo List */}
                <div className="left-column">
                    <div className="glass-card form-section">
                        <WorkoutForm onWorkoutAdded={fetchWorkouts} />
                    </div>

                    <div className="glass-card todo-section">
                        <h3 className="section-title">Daily Checklist</h3>
                        <form onSubmit={handleAddTodo} className="todo-input-group">
                            <input
                                type="text"
                                className="todo-input"
                                placeholder="Add task..."
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                            />
                            <button type="submit" className="todo-add-btn">Add</button>
                        </form>
                        <ul className="todo-list">
                            {todos.map(todo => (
                                <li key={todo.id} className="todo-item">
                                    <input
                                        type="checkbox"
                                        className="todo-checkbox"
                                        checked={todo.completed}
                                        onChange={() => toggleTodo(todo.id)}
                                    />
                                    <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                                        {todo.text}
                                    </span>
                                    <button onClick={() => deleteTodo(todo.id)} className="todo-delete-btn">
                                        <FaTrash size={12} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="history-section">
                    <h2 className="section-title">History</h2>
                    <div className="history-list">
                        {workouts.length > 0 ? (
                            workouts.map(workout => (
                                <div key={workout._id} className="glass-card workout-item">
                                    <div className="workout-icon-wrapper">
                                        <FaFireAlt />
                                    </div>
                                    <div className="workout-info">
                                        <h3>{workout.type || 'Workout'}</h3>
                                        <div className="workout-meta">
                                            <span><FaRegCalendarAlt size={12} /> {new Date(workout.date || workout.createdAt).toLocaleDateString()}</span>
                                            <span className="dot">•</span>
                                            <span>{workout.duration} min</span>
                                            <span className="dot">•</span>
                                            <span className="highlight-calories">{workout.calories} kcal</span>
                                        </div>
                                    </div>
                                    <button className="delete-icon-btn" onClick={() => handleDelete(workout._id)}>
                                        <FaTrash />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No workouts logged yet. Get moving!</p>
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

                .workouts-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 30px;
                    align-items: start;
                }
                
                .left-column {
                    display: flex;
                    flex-direction: column;
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

                /* Todo List Styles */
                .todo-input-group {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .todo-input {
                    flex: 1;
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05);
                    color: white;
                    outline: none;
                }
                
                .todo-add-btn {
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: none;
                    background: #2ecc71;
                    color: white;
                    cursor: pointer;
                }

                .todo-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .todo-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: #ddd;
                }
                
                .todo-item:last-child {
                    border-bottom: none;
                }

                .todo-checkbox {
                    width: 18px;
                    height: 18px;
                    accent-color: #2ecc71;
                    cursor: pointer;
                }

                .todo-text {
                    flex: 1;
                    font-size: 0.95rem;
                }

                .todo-text.completed {
                    text-decoration: line-through;
                    color: #777;
                }
                
                .todo-delete-btn {
                    background: transparent;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                
                .todo-delete-btn:hover {
                    color: #ff4757;
                }

                /* Form specific styles (backup if needed) */
                .form-section input, .form-section select {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    border-radius: 10px;
                    padding: 10px;
                    width: 100%;
                    outline: none;
                }
                
                .section-title {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: #ddd;
                }

                .workout-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 15px;
                    cursor: pointer;
                }

                .workout-item:hover {
                    transform: translateY(-3px) scale(1.01);
                    background: rgba(40, 40, 40, 0.7);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                }

                .workout-icon-wrapper {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                }

                .workout-info h3 {
                    margin: 0 0 5px 0;
                    color: #fff;
                    font-size: 1.1rem;
                }

                .workout-meta {
                    color: #aaa;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .dot {
                    color: #555;
                }

                .highlight-calories {
                    color: #ff8e53;
                    font-weight: 600;
                }

                .delete-icon-btn {
                    margin-left: auto;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #666;
                    cursor: pointer;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    opacity: 0; 
                }

                .workout-item:hover .delete-icon-btn {
                    opacity: 1;
                }

                .delete-icon-btn:hover {
                    background: rgba(255, 60, 60, 0.15);
                    color: #ff4757;
                    border-color: #ff4757;
                }

                .empty-state {
                    text-align: center;
                    color: #666;
                    padding: 40px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 20px;
                }

                @media (max-width: 900px) {
                    .workouts-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Workouts;
