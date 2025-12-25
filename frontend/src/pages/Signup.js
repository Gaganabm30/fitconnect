import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signup(username, email, password);
      navigate('/'); // Redirect to home/dashboard after signup
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error creating account');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-image"></div>
      <div className="auth-overlay"></div>

      <div className="auth-card">
        <h1 className="auth-title">Join Us</h1>
        <p className="auth-subtitle">Create your account to start your journey</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={onChange}
              required
            />
            <FaUser className="input-icon" />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={onChange}
              required
            />
            <FaEnvelope className="input-icon" />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
            />
            <FaLock className="input-icon" />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={onChange}
              required
              minLength="6"
            />
            <FaLock className="input-icon" />
          </div>

          <button type="submit" className="auth-btn">
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="auth-link">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
