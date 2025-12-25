import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaDumbbell, FaAppleAlt, FaUsers, FaBullseye, FaQuestionCircle, FaSignOutAlt, FaUserFriends } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    // Close sidebar when a link is clicked (useful for mobile)
    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h3>FitConnect</h3>
                {/* Close button for mobile */}
                <button className="close-sidebar-btn" onClick={onClose}>×</button>
            </div>

            <div className="sidebar-menu">
                <div className="menu-group">
                    <p className="menu-title">Main</p>
                    <Link to="/dashboard" className={`menu-item ${isActive('/dashboard')}`} onClick={handleLinkClick}>
                        <FaHome className="menu-icon" />
                        <span>Overview</span>
                    </Link>
                    <Link to="/teams" className={`menu-item ${isActive('/teams')}`} onClick={handleLinkClick}>
                        <FaUserFriends className="menu-icon" />
                        <span>Teams</span>
                    </Link>
                    <Link to="/workouts" className={`menu-item ${isActive('/workouts')}`} onClick={handleLinkClick}>
                        <FaDumbbell className="menu-icon" />
                        <span>Workouts</span>
                    </Link>
                    <Link to="/nutrition" className={`menu-item ${isActive('/nutrition')}`} onClick={handleLinkClick}>
                        <FaAppleAlt className="menu-icon" />
                        <span>Nutrition</span>
                    </Link>
                    <Link to="/social" className={`menu-item ${isActive('/social')}`} onClick={handleLinkClick}>
                        <FaUsers className="menu-icon" />
                        <span>Community</span>
                    </Link>
                    <Link to="/goals" className={`menu-item ${isActive('/goals')}`} onClick={handleLinkClick}>
                        <FaBullseye className="menu-icon" />
                        <span>Goals</span>
                    </Link>
                    <Link to="/profile" className={`menu-item ${isActive('/profile')}`} onClick={handleLinkClick}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ccc', overflow: 'hidden', display: 'flex' }}>
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Profile" style={{ width: '100%' }} />
                        </div>
                        <span>Profile</span>
                    </Link>
                </div>

                <div className="menu-group">
                    <p className="menu-title">Support</p>
                    <Link to="/help" className="menu-item" onClick={handleLinkClick}>
                        <FaQuestionCircle className="menu-icon" />
                        <span>Help Center</span>
                    </Link>
                </div>
            </div>

            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn">
                    <FaSignOutAlt className="menu-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
