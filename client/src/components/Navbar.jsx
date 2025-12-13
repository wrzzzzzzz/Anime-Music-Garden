import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaSeedling, FaPlus, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <FaSeedling className="brand-icon" />
            <span>Anime Music Garden</span>
          </Link>
          <div className="navbar-links">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link nav-link-primary">Register</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/garden" className="navbar-brand">
          <FaSeedling className="brand-icon" />
          <span>Anime Music Garden</span>
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">
            <FaHome /> Dashboard
          </Link>
          <Link to="/garden" className="nav-link">
            <FaSeedling /> Garden
          </Link>
          <Link to="/checkin" className="nav-link">
            <FaPlus /> New Check-in
          </Link>
          <Link to="/profile" className="nav-link">
            <FaUser /> {user?.username}
          </Link>
          <button onClick={handleLogout} className="nav-link nav-button">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

