import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTrophy, FaUserPlus, FaSearch, FaMedal } from 'react-icons/fa';

const Social = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get('/social/leaderboard');
                setLeaderboard(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchLeaderboard();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.get(`/users?search=${searchTerm}`);
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const addFriend = async (id) => {
        try {
            await api.post(`/social/friends/${id}`);
            alert('Friend added!');
        } catch (error) {
            alert('Error adding friend (or already friends)');
        }
    };

    const getRankIcon = (index) => {
        if (index === 0) return <FaMedal color="#ffd700" size={24} />;
        if (index === 1) return <FaMedal color="#c0c0c0" size={24} />;
        if (index === 2) return <FaMedal color="#cd7f32" size={24} />;
        return <span className="rank-number">#{index + 1}</span>;
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Community <FaTrophy style={{ fontSize: '0.8em', verticalAlign: 'middle', color: '#f1c40f' }} /></h1>

            <div className="social-grid">
                {/* Leaderboard Section */}
                <div className="glass-card leaderboard-section">
                    <h2 className="section-title">Weekly Leaderboard</h2>
                    <div className="leaderboard-list">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((entry, index) => (
                                <div key={entry._id} className={`leaderboard-item rank-${index + 1}`}>
                                    <div className="rank-icon">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="user-avatar">
                                        <img src={`https://ui-avatars.com/api/?name=${entry.name}&background=random`} alt={entry.name} />
                                    </div>
                                    <div className="user-details">
                                        <strong>{entry.name}</strong>
                                        <span className="user-score">{entry.totalCalories} <small>kcal</small></span>
                                    </div>
                                    {index < 3 && <div className="shine-effect"></div>}
                                </div>
                            ))
                        ) : (
                            <p className="empty-text">No leaderboard data yet.</p>
                        )}
                    </div>
                </div>

                {/* Friend Search Section */}
                <div className="glass-card friends-section">
                    <h2 className="section-title">Find Friends</h2>
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search users by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="search-btn">Search</button>
                    </form>

                    <div className="users-list">
                        {users.map(user => (
                            <div key={user._id} className="user-card">
                                <div className="user-card-content">
                                    <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="user-avatar-small" />
                                    <span>{user.name}</span>
                                </div>
                                <button onClick={() => addFriend(user._id)} className="add-friend-btn">
                                    <FaUserPlus /> Add
                                </button>
                            </div>
                        ))}
                        {users.length === 0 && searchTerm && <p className="empty-text">No users found.</p>}
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

                .social-grid {
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

                .glass-card:hover {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }

                .section-title {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: #ddd;
                }

                /* Leaderboard Styles */
                .leaderboard-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .leaderboard-item {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s, background 0.2s;
                }

                .leaderboard-item:hover {
                    transform: scale(1.02);
                    background: rgba(255, 255, 255, 0.08);
                }

                .rank-icon {
                    width: 40px;
                    display: flex;
                    justify-content: center;
                    font-weight: bold;
                    color: #888;
                }

                .rank-number {
                    font-size: 1.1rem;
                }

                .user-avatar img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin: 0 15px;
                    border: 2px solid rgba(255,255,255,0.1);
                }

                .user-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .user-details strong {
                    color: #fff;
                    font-size: 1rem;
                }

                .user-score {
                    color: #f1c40f;
                    font-weight: 600;
                }

                .user-score small {
                    color: #888;
                    font-weight: 400;
                    font-size: 0.8rem;
                }

                /* Special styles for top 3 */
                .rank-1 { background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255,255,255,0.02)); border: 1px solid rgba(255, 215, 0, 0.3); }
                .rank-2 { background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), rgba(255,255,255,0.02)); border: 1px solid rgba(192, 192, 192, 0.3); }
                .rank-3 { background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), rgba(255,255,255,0.02)); border: 1px solid rgba(205, 127, 50, 0.3); }

                /* Search & Friends Styles */
                .search-form {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .search-input-wrapper {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    color: #888;
                }

                .search-input-wrapper input {
                    width: 100%;
                    padding: 12px 12px 12px 40px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    outline: none;
                    transition: border-color 0.3s;
                }

                .search-input-wrapper input:focus {
                    border-color: #3498db;
                }

                .search-btn {
                    padding: 0 20px;
                    background: #3498db;
                    border: none;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.2s;
                }

                .search-btn:hover {
                    background: #2980b9;
                }

                .user-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .user-card:last-child {
                    border-bottom: none;
                }

                .user-card-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #fff;
                }

                .user-avatar-small {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                }

                .add-friend-btn {
                    background: rgba(46, 204, 113, 0.15);
                    color: #2ecc71;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.85rem;
                    transition: background 0.2s;
                }

                .add-friend-btn:hover {
                    background: rgba(46, 204, 113, 0.3);
                }

                .empty-text {
                    color: #666;
                    text-align: center;
                    font-style: italic;
                    margin-top: 20px;
                }

                @media (max-width: 900px) {
                    .social-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Social;
