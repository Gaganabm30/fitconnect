import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaPlusCircle, FaSignInAlt, FaTrophy, FaMedal, FaClipboardList, FaCommentDots, FaPaperPlane, FaCheckCircle, FaTimes } from 'react-icons/fa';

const Teams = () => {
    const { user } = useAuth();
    const [myTeam, setMyTeam] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('dashboard');
    const [formData, setFormData] = useState({ name: '', description: '', inviteCode: '' });
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [challengeData, setChallengeData] = useState({ title: '', type: 'Calories', targetValue: '', endDate: '' });

    // Chat State
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchMyTeam();
    }, []);

    useEffect(() => {
        if (showChat && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [showChat, myTeam]);

    const fetchMyTeam = async () => {
        try {
            const { data } = await api.get('/teams/myteam');
            if (data) {
                setMyTeam(data.team);
                setChallenges(data.challenges || []);
            } else {
                setMyTeam(null);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching team:", error);
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/teams', {
                name: formData.name,
                description: formData.description
            });
            setMyTeam(data);
            setView('dashboard');
        } catch (error) {
            alert('Failed to create team');
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/teams/join', {
                inviteCode: formData.inviteCode
            });
            setMyTeam(data);
            setView('dashboard');
        } catch (error) {
            alert('Invalid invite code or already in team');
        }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm("Are you sure you want to leave the team?")) return;
        try {
            await api.post('/teams/leave');
            setMyTeam(null);
            setChallenges([]);
            setView('dashboard');
        } catch (error) {
            alert('Failed to leave team');
        }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/challenges', {
                teamId: myTeam._id,
                ...challengeData,
                targetValue: Number(challengeData.targetValue)
            });
            setChallenges([data, ...challenges]);
            setShowChallengeForm(false);
            setChallengeData({ title: '', type: 'Calories', targetValue: '', endDate: '' });
            fetchMyTeam(); // Refresh to update feed too
        } catch (error) {
            alert('Failed to create challenge');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        try {
            const { data } = await api.post('/teams/chat', { message: chatMessage });
            // Optimistically update chat or re-fetch
            const updatedChat = [...(myTeam.chat || []), data];
            setMyTeam({ ...myTeam, chat: updatedChat });
            setChatMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (loading) return <div className="page-container" style={{ color: 'white' }}>Loading...</div>;

    if (!myTeam) {
        return (
            <div className="page-container">
                <h1 className="page-title">Team Collaboration <FaUsers style={{ fontSize: '0.8em', color: '#3498db' }} /></h1>

                <div className="no-team-container">
                    <div className="glass-card option-card" onClick={() => setView('create')}>
                        <FaPlusCircle className="option-icon" />
                        <h2>Create a Team</h2>
                        <p>Start your own fitness squad and invite friends.</p>
                        {view === 'create' && (
                            <form onSubmit={handleCreateTeam} className="team-form" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    placeholder="Team Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Motto/Description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                                <button type="submit" className="primary-btn">Create Team</button>
                            </form>
                        )}
                    </div>

                    <div className="glass-card option-card" onClick={() => setView('join')}>
                        <FaSignInAlt className="option-icon" />
                        <h2>Join a Team</h2>
                        <p>Enter a code to join an existing team.</p>
                        {view === 'join' && (
                            <form onSubmit={handleJoinTeam} className="team-form" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    placeholder="Enter Invite Code"
                                    value={formData.inviteCode}
                                    onChange={e => setFormData({ ...formData, inviteCode: e.target.value })}
                                    required
                                />
                                <button type="submit" className="primary-btn">Join Team</button>
                            </form>
                        )}
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

                    .no-team-container {
                        display: flex;
                        gap: 30px;
                        justify-content: center;
                        margin-top: 50px;
                    }

                    .glass-card {
                        background: rgba(30, 30, 30, 0.6);
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: 20px;
                        padding: 40px;
                        width: 40%;
                        text-align: center;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        cursor: pointer;
                    }

                    .glass-card:hover {
                        transform: translateY(-5px);
                        background: rgba(40, 40, 40, 0.8);
                        border-color: rgba(52, 152, 219, 0.5);
                    }

                    .option-icon {
                        font-size: 3rem;
                        color: #3498db;
                        margin-bottom: 20px;
                    }

                    .glass-card h2 {
                        color: white;
                        margin-bottom: 10px;
                    }

                    .glass-card p {
                        color: #aaa;
                        margin-bottom: 20px;
                    }

                    .team-form {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        margin-top: 20px;
                        animation: fadeIn 0.3s ease;
                    }

                    .team-form input {
                        padding: 12px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        color: white;
                        outline: none;
                    }

                    .primary-btn {
                        padding: 12px;
                        background: linear-gradient(45deg, #3498db, #2980b9);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    // --- Team Dashboard View ---
    return (
        <div className="page-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">{myTeam.name} <FaUsers style={{ fontSize: '0.6em', color: '#3498db' }} /></h1>
                    <p className="team-desc">{myTeam.description}</p>
                </div>
                <div className="header-actions">
                    <button onClick={handleLeaveTeam} className="leave-btn">Leave Team</button>
                    <div className="invite-box">
                        <span>Invite Code:</span>
                        <strong onClick={() => navigator.clipboard.writeText(myTeam.inviteCode)} title="Click to copy">{myTeam.inviteCode}</strong>
                    </div>
                </div>
            </div>

            <div className="team-grid">
                {/* Left: Activity & Stats */}
                <div className="left-panel">
                    <div className="glass-card stats-card">
                        <div className="stat-item">
                            <h3>{myTeam.members.length}</h3>
                            <span>Members</span>
                        </div>
                        <div className="stat-item">
                            <h3>{myTeam.totalScore}</h3>
                            <span>Total Score</span>
                        </div>
                        <div className="stat-item">
                            <h3>{Array.isArray(myTeam.activityFeed) ? myTeam.activityFeed.length : 0}</h3>
                            <span>Activities</span>
                        </div>
                    </div>

                    <div className="glass-card activity-feed">
                        <h3 className="section-title"><FaClipboardList /> Team Activity</h3>
                        <div className="feed-list">
                            {myTeam.activityFeed && myTeam.activityFeed.map((activity, idx) => (
                                <div key={idx} className="feed-item">
                                    <div className="feed-user-avatar">
                                        {activity.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="feed-content">
                                        <span className="feed-user">{activity.user?.name || 'User'}</span>
                                        <span className="feed-message">{activity.message}</span>
                                        <span className="feed-time">{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Challenges & Leaderboard */}
                <div className="right-panel">
                    <div className="glass-card">
                        <h3 className="section-title">
                            <FaTrophy /> Active Challenges
                            {!showChallengeForm && <button onClick={() => setShowChallengeForm(true)} className="sm-btn" style={{ marginLeft: 'auto' }}>+ New</button>}
                        </h3>

                        {showChallengeForm && (
                            <form onSubmit={handleCreateChallenge} className="challenge-form">
                                <input
                                    type="text"
                                    placeholder="Challenge Title"
                                    value={challengeData.title}
                                    onChange={e => setChallengeData({ ...challengeData, title: e.target.value })}
                                    required
                                />
                                <div className="form-row">
                                    <select
                                        value={challengeData.type}
                                        onChange={e => setChallengeData({ ...challengeData, type: e.target.value })}
                                    >
                                        <option value="Calories">Calories</option>
                                        <option value="Workouts">Workouts Count</option>
                                        <option value="Minutes">Active Minutes</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Target"
                                        value={challengeData.targetValue}
                                        onChange={e => setChallengeData({ ...challengeData, targetValue: e.target.value })}
                                        required
                                    />
                                </div>
                                <input
                                    type="date"
                                    value={challengeData.endDate}
                                    onChange={e => setChallengeData({ ...challengeData, endDate: e.target.value })}
                                    required
                                />
                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowChallengeForm(false)} className="cancel-btn">Cancel</button>
                                    <button type="submit" className="primary-btn">Create</button>
                                </div>
                            </form>
                        )}

                        <div className="challenges-list">
                            {challenges.length > 0 ? (
                                challenges.map(challenge => {
                                    const isCompleted = challenge.currentProgress >= challenge.targetValue;
                                    return (
                                        <div key={challenge._id} className="challenge-item">
                                            <div className="challenge-header">
                                                <h4>{challenge.title}</h4>
                                                <span className={`status ${challenge.status.toLowerCase()}`}>{challenge.status}</span>
                                            </div>

                                            {/* REPLACED PROGRESS BAR WITH TARGET + TICK */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                                                <div style={{ fontSize: '1rem', color: '#fff' }}>
                                                    Target: <strong style={{ fontSize: '1.2rem', color: '#3498db' }}>{challenge.targetValue}</strong> {challenge.type}
                                                </div>
                                                <div style={{ transform: 'scale(1.2)' }}>
                                                    {isCompleted ? (
                                                        <FaCheckCircle color="#2ecc71" size={28} title="Keep it up!" />
                                                    ) : (
                                                        <span style={{ fontSize: '1.5rem', filter: 'grayscale(1)' }}>⏳</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                !showChallengeForm && <p className="empty-text">No active challenges.</p>
                            )}
                        </div>
                    </div>

                    <div className="glass-card leaderboard">
                        <h3 className="section-title"><FaMedal /> Leaderboard</h3>
                        <div className="leaderboard-list">
                            {myTeam.members.map((member, index) => (
                                <div key={member._id} className="leaderboard-item">
                                    <span className="rank">#{index + 1}</span>
                                    <span className="member-name">{member.name || member.email}</span>
                                    {index === 0 && <span className="badge">👑</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Chat Widget --- */}
            <div className="chat-widget">
                {/* Floating Button */}
                <button
                    className="floating-chat-btn"
                    onClick={() => setShowChat(!showChat)}
                    style={{ background: showChat ? '#e74c3c' : '#3498db' }}
                >
                    {showChat ? <FaTimes /> : <FaCommentDots />}
                </button>

                {/* Chat Window */}
                {showChat && (
                    <div className="chat-window">
                        <div className="chat-header">
                            <h3>Team Chat</h3>
                        </div>
                        <div className="chat-messages">
                            {myTeam.chat && myTeam.chat.map((msg, i) => (
                                <div key={i} className={`chat-message ${msg.user?._id === user?._id ? 'my-msg' : ''}`}>
                                    <div className="msg-user">{msg.user?.name || 'User'}</div>
                                    <div className="msg-text">{msg.message}</div>
                                </div>
                            ))}
                            <div ref={chatEndRef}></div>
                        </div>
                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={chatMessage}
                                onChange={e => setChatMessage(e.target.value)}
                            />
                            <button type="submit"><FaPaperPlane /></button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                .page-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, #ccc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .team-desc {
                    color: #aaa;
                    margin-bottom: 2rem;
                }
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .invite-box {
                    background: rgba(52, 152, 219, 0.1);
                    padding: 10px 20px;
                    border-radius: 10px;
                    border: 1px solid rgba(52, 152, 219, 0.3);
                    color: #3498db;
                }
                .invite-box strong {
                    margin-left: 10px;
                    font-size: 1.2rem;
                    letter-spacing: 2px;
                    cursor: pointer;
                }
                
                .team-grid {
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
                    margin-bottom: 30px;
                }

                .stats-card {
                    display: flex;
                    justify-content: space-around;
                    text-align: center;
                }
                .stat-item h3 {
                    font-size: 2rem;
                    color: white;
                    margin: 0;
                }
                .stat-item span {
                    color: #888;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }

                .section-title {
                    color: #ddd;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* ... existing feed CSS ... */
                .feed-list { max-height: 400px; overflow-y: auto; }
                .feed-item { display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .feed-user-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #3498db, #8e44ad); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
                .feed-content { display: flex; flex-direction: column; }
                .feed-user { color: white; font-weight: 600; }
                .feed-message { color: #aaa; font-size: 0.9rem; }
                .feed-time { color: #666; font-size: 0.75rem; margin-top: 5px; }

                .leaderboard-item { display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); margin-bottom: 8px; border-radius: 8px; }
                .rank { font-weight: bold; color: #3498db; width: 40px; }
                .member-name { color: white; flex: 1; }
                .badge { font-size: 1.2rem; }

                .header-actions { display: flex; align-items: center; gap: 15px; }
                .leave-btn { background: transparent; border: 1px solid #e74c3c; color: #e74c3c; padding: 8px 15px; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
                .leave-btn:hover { background: #e74c3c; color: white; }

                .sm-btn { padding: 5px 10px; font-size: 0.8rem; background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 5px; cursor: pointer; }
                
                .challenge-form { background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
                .challenge-form input, .challenge-form select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px; border-radius: 5px; outline: none; }
                .challenge-form option { background: #222; color: white; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .form-actions { display: flex; justify-content: flex-end; gap: 10px; }
                .cancel-btn { background: transparent; color: #aaa; border: none; cursor: pointer; }
                
                .challenges-list { display: flex; flex-direction: column; gap: 15px; }
                .challenge-item { background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; }
                .challenge-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .challenge-header h4 { margin: 0; color: white; }
                .status { font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; }
                .status.active { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
                .status.completed { background: rgba(52, 152, 219, 0.2); color: #3498db; }
                
                .primary-btn { padding: 10px 20px; background: #3498db; border: none; border-radius: 8px; color: white; cursor: pointer; }

                /* CHAT WIDGET STYLES */
                .floating-chat-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #3498db;
                    color: white;
                    border: none;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.4);
                    font-size: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                    z-index: 1000;
                }
                .floating-chat-btn:hover {
                    transform: scale(1.1);
                }

                .chat-window {
                    position: fixed;
                    bottom: 100px;
                    right: 30px;
                    width: 350px;
                    height: 500px;
                    background: #1a1a1a;
                    border-radius: 20px;
                    border: 1px solid rgba(52, 152, 219, 0.3);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    z-index: 1000;
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .chat-header {
                    background: #3498db;
                    padding: 15px;
                    color: white;
                }
                .chat-header h3 { margin: 0; font-size: 1.1rem; }

                .chat-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    background: rgba(0,0,0,0.2);
                }

                .chat-message {
                    background: rgba(255,255,255,0.05);
                    padding: 10px;
                    border-radius: 10px;
                    max-width: 80%;
                }
                .chat-message.my-msg {
                    align-self: flex-end;
                    background: rgba(52, 152, 219, 0.2);
                    border: 1px solid rgba(52, 152, 219, 0.3);
                }

                .msg-user { font-size: 0.75rem; color: #888; margin-bottom: 2px; }
                .msg-text { color: white; word-wrap: break-word; }

                .chat-input-area {
                    padding: 15px;
                    background: #222;
                    display: flex;
                    gap: 10px;
                }
                .chat-input-area input {
                    flex: 1;
                    padding: 10px;
                    border-radius: 20px;
                    border: none;
                    background: #333;
                    color: white;
                    outline: none;
                }
                .chat-input-area button {
                    background: #3498db;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};

export default Teams;
