import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../pages/DashboardLayout.css';

const SharedLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const getBackgroundImage = () => {
        switch (location.pathname) {
            case '/workouts':
                return 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1740")';
            case '/nutrition':
                return 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1740")';
            case '/social':
                return 'url("https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1740")';
            case '/goals':
                return 'url("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1740")';
            default: // Dashboard and others
                return 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1740&auto=format&fit=crop")';
        }
    };

    return (
        <div className="dashboard-layout">
            <div
                className="dashboard-bg"
                style={{ backgroundImage: getBackgroundImage() }}
            ></div>
            <div className="dashboard-overlay"></div>

            {/* Mobile Toggle Button */}
            <button
                className="mobile-toggle-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                ☰
            </button>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="main-content">
                <Outlet />
            </div>

            {/* Overlay to close sidebar on mobile when open */}
            {isSidebarOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default SharedLayout;
