import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaUsers, FaArrowRight, FaChartLine } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Dynamic Background */}
      <div className="background-animation"></div>

      <div className="overlay">
        {/* Navigation is handled by Navbar component, but let's ensure spacing */}

        {/* Hero Section */}
        <section className="hero-container">
          <div className="hero-content animate-fade-up">
            <h1 className="brand-title">Fit<span className="highlight">Connect</span></h1>
            <h2 className="tagline">Transform Your Body, Elevate Your Life.</h2>
            <p className="description">
              The ultimate platform to track workouts, monitor nutrition, and reach your fitness goals
              with a supportive community.
            </p>
            <div className="cta-wrapper">
              <Link to="/signup" className="cta-button primary glow-on-hover">
                Start Journey <FaArrowRight className="icon" />
              </Link>
              <Link to="/login" className="cta-button secondary">
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-container">
          <div className="feature-card animate-delay-1">
            <div className="icon-wrapper">
              <FaDumbbell />
            </div>
            <h3>Smart Tracking</h3>
            <p>Log every rep, set, and mile. Visualize your progress with intuitive charts.</p>
          </div>

          <div className="feature-card animate-delay-2">
            <div className="icon-wrapper">
              <FaChartLine />
            </div>
            <h3>Health Metrics</h3>
            <p>Monitor calories, nutrition, and vital stats to stay on top of your health.</p>
          </div>

          <div className="feature-card animate-delay-3">
            <div className="icon-wrapper">
              <FaUsers />
            </div>
            <h3>Community</h3>
            <p>Join challenges, compete on leaderboards, and find fitness buddies.</p>
          </div>
        </section>
      </div>

      <style>{`
        /* Global Reset for this page */
        .landing-page {
          position: relative;
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          color: white;
        }

        /* Background Animation */
        .background-animation {
          position: fixed; /* Stays fixed while body scrolls */
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          /* Outdoor fitness image (Forest/Running) */
          background: url('https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1740&auto=format&fit=crop') no-repeat center center/cover;
          z-index: -2;
          animation: zoomEffect 20s infinite alternate;
        }

        @keyframes zoomEffect {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        /* Dark Overlay */
        .overlay {
          position: relative; /* Changed to relative so parent container grows with content */
          width: 100%;
          min-height: 100vh; /* Ensure it covers at least the full viewport */
          background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.8) 100%);
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 3rem;
        }

        /* Hero Styling */
        .hero-container {
          text-align: center;
          padding: 2rem;
          max-width: 900px;
          margin-top: 120px; /* Increased top margin for spacing under floating navbar */
          position: relative;
          z-index: 2;
        }

        .brand-title {
          font-size: 5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -2px;
          text-transform: uppercase;
          background: linear-gradient(to right, #ffffff, #a0a0a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-title .highlight {
          color: var(--primary-color); 
          -webkit-text-fill-color: var(--primary-color); /* Fallback to theme color if needed */
          /* Note: using css var from globals */
          color: #ff6b6b;
          -webkit-text-fill-color: #ff6b6b;
        }

        .tagline {
          font-size: 2rem;
          font-weight: 300;
          margin-bottom: 1.5rem;
          color: #e0e0e0;
        }

        .description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #ccc;
          margin-bottom: 3rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        /* CTA Buttons */
        .cta-wrapper {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 4rem;
        }

        .cta-button {
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: linear-gradient(45deg, #ff6b6b, #ff8e53);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }

        .cta-button.secondary {
          background: transparent;
          border: 2px solid rgba(255,255,255,0.2);
          color: white;
        }

        .cta-button:hover {
          transform: translateY(-3px);
        }

        .cta-button.primary:hover {
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
        }

        .cta-button.secondary:hover {
          border-color: white;
          background: rgba(255,255,255,0.1);
        }

        /* Features Styling */
        .features-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          max-width: 1200px;
          width: 90%;
          padding-bottom: 4rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05); /* Glassmorphism */
          backdrop-filter: blur(10px);
          padding: 30px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          transition: all 0.4s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .icon-wrapper {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #ff6b6b;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .feature-card:hover .icon-wrapper {
          transform: scale(1.2) rotate(5deg);
        }

        .feature-card h3 {
          margin-bottom: 10px;
          font-size: 1.5rem;
        }

        .feature-card p {
          color: #aaa;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* Animations */
        .animate-fade-up {
          animation: fadeUp 1s ease-out forwards;
          opacity: 0;
        }

        .animate-delay-1 { animation: fadeUp 0.8s ease-out 0.3s forwards; opacity: 0; }
        .animate-delay-2 { animation: fadeUp 0.8s ease-out 0.5s forwards; opacity: 0; }
        .animate-delay-3 { animation: fadeUp 0.8s ease-out 0.7s forwards; opacity: 0; }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .brand-title { font-size: 3rem; }
          .tagline { font-size: 1.5rem; }
          .hero-container { padding: 1rem; margin-top: 30px; }
          .cta-wrapper { flex-direction: column; }
          .cta-button { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
