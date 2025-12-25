import React from 'react';
import './Footer.css';
import { FaHeartbeat, FaDumbbell, FaAppleAlt, FaRunning } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="brand-lockup">
                        <FaHeartbeat className="brand-icon" />
                        <h3>FitConnect</h3>
                    </div>
                    <p className="footer-description">
                        Your ultimate companion for tracking workouts, monitoring nutrition, and achieving your health goals.
                        Join our community and transform your life today.
                    </p>
                </div>

                <div className="footer-socials">
                    <span className="social-link" title="Workouts"><FaDumbbell /></span>
                    <span className="social-link" title="Nutrition"><FaAppleAlt /></span>
                    <span className="social-link" title="Cardio"><FaRunning /></span>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} FitConnect. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
