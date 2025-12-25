import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCarrot, FaUtensils, FaLeaf, FaBreadSlice, FaEgg, FaDrumstickBite, FaTrash } from 'react-icons/fa';

const Nutrition = () => {
    const [meals, setMeals] = useState([]);
    const [formData, setFormData] = useState({
        mealType: 'Breakfast',
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
    });

    const fetchMeals = async () => {
        try {
            const { data } = await api.get('/nutrition');
            setMeals(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/nutrition', {
                ...formData,
                calories: Number(formData.calories),
                protein: Number(formData.protein),
                carbs: Number(formData.carbs),
                fat: Number(formData.fat)
            });
            fetchMeals();
            setFormData({
                mealType: 'Breakfast',
                foodName: '',
                calories: '',
                protein: '',
                carbs: '',
                fat: ''
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this meal?')) return;
        try {
            await api.delete(`/nutrition/${id}`);
            setMeals(meals.filter(meal => meal._id !== id));
        } catch (error) {
            console.error("Error deleting meal", error);
        }
    };

    // Helper to get icon for meal type
    const getMealIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'breakfast': return <FaEgg />;
            case 'lunch': return <FaBreadSlice />;
            case 'dinner': return <FaDrumstickBite />;
            case 'snack': return <FaLeaf />;
            default: return <FaUtensils />;
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Nutrition Tracker <FaCarrot style={{ fontSize: '0.8em', verticalAlign: 'middle', color: '#2ecc71' }} /></h1>

            <div className="nutrition-grid">
                {/* Form Section */}
                <div className="glass-card form-section">
                    <h3 className="section-title">Add Meal</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-row">
                            <div className="form-group">
                                <label>Meal Type</label>
                                <select name="mealType" value={formData.mealType} onChange={handleChange}>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snack">Snack</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Food Name</label>
                                <input type="text" name="foodName" value={formData.foodName} onChange={handleChange} placeholder="e.g. Avocado Toast" required />
                            </div>
                        </div>

                        <div className="macros-inputs">
                            <div className="form-group">
                                <label>Calories</label>
                                <input type="number" name="calories" value={formData.calories} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Protein (g)</label>
                                <input type="number" name="protein" value={formData.protein} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Carbs (g)</label>
                                <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Fat (g)</label>
                                <input type="number" name="fat" value={formData.fat} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" className="primary-btn">Track Meal</button>
                    </form>
                </div>

                {/* History Section */}
                <div className="history-section">
                    <h2 className="section-title">Today's Macros</h2>
                    <div className="history-list">
                        {meals.length > 0 ? (
                            meals.map(meal => (
                                <div key={meal._id} className="glass-card meal-item">
                                    <div className="meal-icon-wrapper" data-type={meal.mealType}>
                                        {getMealIcon(meal.mealType)}
                                    </div>
                                    <div className="meal-details">
                                        <div className="meal-header">
                                            <h4>{meal.foodName}</h4>
                                            <span className="meal-time">{meal.mealType}</span>
                                        </div>
                                        <div className="macro-pills">
                                            <span className="cal-pill">{meal.calories} kcal</span>
                                            <span className="macro-pill">P: {meal.protein}g</span>
                                            <span className="macro-pill">C: {meal.carbs}g</span>
                                            <span className="macro-pill">F: {meal.fat}g</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(meal._id)} className="delete-icon-btn">
                                        <FaTrash />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No meals tracked today. Eat something healthy!</p>
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

                .nutrition-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
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

                .section-title {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: #ddd;
                }

                /* Form Styles */
                .form-group {
                    margin-bottom: 15px;
                    flex: 1;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #aaa;
                    font-size: 0.85rem;
                }

                .form-group input, .form-group select {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    outline: none;
                }

                .form-group input:focus, .form-group select:focus {
                    border-color: #2ecc71;
                }

                .input-row {
                    display: flex;
                    gap: 15px;
                }

                .macros-inputs {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                    gap: 10px;
                }

                .primary-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(45deg, #2ecc71, #27ae60);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 10px;
                    transition: transform 0.2s;
                }

                .primary-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
                }

                /* Meal Item Styles */
                .meal-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 15px;
                }

                .meal-item:hover {
                    transform: translateX(5px);
                    background: rgba(30, 30, 30, 0.8);
                }

                .meal-icon-wrapper {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    color: white;
                }

                .meal-icon-wrapper[data-type="Breakfast"] { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
                .meal-icon-wrapper[data-type="Lunch"] { background: rgba(230, 126, 34, 0.2); color: #e67e22; }
                .meal-icon-wrapper[data-type="Dinner"] { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }
                .meal-icon-wrapper[data-type="Snack"] { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }

                .meal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    width: 100%;
                }

                .meal-details {
                    flex: 1;
                }

                .meal-header h4 {
                    margin: 0;
                    color: #fff;
                    font-size: 1rem;
                }

                .meal-time {
                    font-size: 0.75rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .macro-pills {
                    display: flex;
                    gap: 8px;
                }

                .cal-pill {
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .macro-pill {
                    font-size: 0.8rem;
                    color: #aaa;
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

                .empty-state {
                    text-align: center;
                    color: #666;
                    padding: 40px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 20px;
                }

                @media (max-width: 900px) {
                    .nutrition-grid {
                        grid-template-columns: 1fr;
                    }
                    .macros-inputs {
                        grid-template-columns: 1fr 1fr;
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

export default Nutrition;
