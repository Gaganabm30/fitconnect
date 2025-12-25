import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api'; // Ensure this exists
import { FaUser, FaEnvelope, FaRulerVertical, FaWeight, FaCalendarAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './DashboardLayout.css';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({
        age: '',
        height: '',
        weight: '',
        gender: 'Male'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/ai/profile');
                if (res.data) {
                    setProfileData({
                        age: res.data.age || '',
                        height: res.data.height || '',
                        weight: res.data.weight || '',
                        gender: res.data.gender || 'Male'
                    });
                }
            } catch (error) {
                console.log("No profile found or error fetching");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            await api.post('/ai/profile', {
                ...profileData,
                age: Number(profileData.age),
                height: Number(profileData.height),
                weight: Number(profileData.weight)
            });
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update profile.");
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="dashboard-bg" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop")' }}></div>
            <div className="dashboard-overlay"></div>

            <Sidebar />

            <div className="main-content">
                <header className="dashboard-header-section">
                    <div className="welcome-text">
                        <h1>My Profile</h1>
                        <p>Manage your account settings and personal details.</p>
                    </div>
                </header>

                <div className="profile-container" style={{ maxWidth: '800px' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#333', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=256`} alt="Profile" style={{ width: '100%' }} />
                        </div>
                        <h2 style={{ margin: '0', fontSize: '2rem' }}>{user?.name}</h2>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>{user?.email}</p>

                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="auth-btn" style={{ padding: '10px 30px', fontSize: '0.9rem', marginTop: '1.5rem', width: 'auto' }}>
                                <FaEdit style={{ marginRight: '8px' }} /> Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                                <button onClick={handleSave} className="primary-btn" style={{ padding: '10px 30px' }}>
                                    <FaSave style={{ marginRight: '8px' }} /> Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="text-btn" style={{ color: '#ff6b6b' }}>
                                    <FaTimes style={{ marginRight: '8px' }} /> Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>

                        <div className="glass-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <FaRulerVertical style={{ color: '#ff6b6b', fontSize: '1.2rem' }} />
                                <span style={{ color: '#888' }}>Height (cm)</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={profileData.height}
                                    onChange={e => setProfileData({ ...profileData, height: e.target.value })}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', color: 'white', borderRadius: '5px', width: '100%' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{profileData.height || '-'} cm</div>
                            )}
                        </div>

                        <div className="glass-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <FaWeight style={{ color: '#3498db', fontSize: '1.2rem' }} />
                                <span style={{ color: '#888' }}>Weight (kg)</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={profileData.weight}
                                    onChange={e => setProfileData({ ...profileData, weight: e.target.value })}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', color: 'white', borderRadius: '5px', width: '100%' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{profileData.weight || '-'} kg</div>
                            )}
                        </div>

                        <div className="glass-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <FaCalendarAlt style={{ color: '#2ecc71', fontSize: '1.2rem' }} />
                                <span style={{ color: '#888' }}>Age</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={profileData.age}
                                    onChange={e => setProfileData({ ...profileData, age: e.target.value })}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', color: 'white', borderRadius: '5px', width: '100%' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{profileData.age || '-'}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
