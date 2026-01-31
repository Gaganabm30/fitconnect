import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Social from './pages/Social';
import Goals from './pages/Goals';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import SharedLayout from './components/SharedLayout';
import AICalorieScanner from './pages/AICalorieScanner';
import BurnoutInsightsDashboard from './components/BurnoutInsightsDashboard';
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Routes where we want the full dashboard layout (no global navbar/footer)
  const isDashboardRoute = ['/dashboard', '/teams', '/workouts', '/nutrition', '/social', '/goals', '/profile', '/help', '/ai-scanner'].some(path => location.pathname.startsWith(path));

  // If it's a dashboard route, we don't render the global Navbar/Footer
  // The DashboardLayout handles its own structure (Sidebar + Content)

  return (
    <>
      {!isDashboardRoute && <Navbar />}

      <div
        className={isLanding ? 'landing-layout' : (isDashboardRoute ? '' : 'container')}
        style={isLanding || isDashboardRoute ? {} : { maxWidth: '1200px', margin: '0 auto', padding: '20px' }}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard Routes wrapped in SharedLayout */}
          <Route element={<PrivateRoute><SharedLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path='/ai-scanner' element={<AICalorieScanner />} />
            <Route path='/burnout' element={<BurnoutInsightsDashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/social" element={<Social />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>

      {!isDashboardRoute && <Footer />}
    </>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
