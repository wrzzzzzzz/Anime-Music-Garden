import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaSeedling, FaPlus, FaChartLine, FaStar, FaMusic } from 'react-icons/fa';
import './Dashboard.css';

// Map emotion to color for display
const emotionColorMap = {
  happy: '#FFD700',
  sad: '#4169E1',
  excited: '#FF6347',
  calm: '#98D8C8',
  nostalgic: '#DDA0DD',
  energetic: '#FF4500',
  melancholic: '#9370DB',
  inspired: '#00CED1'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, checkInsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/checkins?limit=5')
      ]);

      setStats(profileRes.data.stats);
      setRecentCheckIns(checkInsRes.data.checkIns);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your garden...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Garden</h1>
        <Link to="/checkin" className="new-checkin-button">
          <FaPlus /> New Check-in
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
            <FaSeedling />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalCheckIns || 0}</h3>
            <p>Total Flowers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats?.checkInsByType?.anime || 0}</h3>
            <p>Anime Episodes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
            <FaMusic />
          </div>
          <div className="stat-content">
            <h3>{(stats?.checkInsByType?.opening || 0) + (stats?.checkInsByType?.ending || 0) + (stats?.checkInsByType?.insert || 0)}</h3>
            <p>Music Tracks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{stats?.averageRating || '0.0'}</h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <h2>Recent Check-ins</h2>
          {recentCheckIns.length === 0 ? (
            <div className="empty-state">
              <FaSeedling className="empty-icon" />
              <p>No check-ins yet. Start growing your garden!</p>
              <Link to="/checkin" className="empty-button">
                <FaPlus /> Add Your First Check-in
              </Link>
            </div>
          ) : (
            <div className="checkins-list">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn._id} className="checkin-item">
                  {checkIn.animeImage ? (
                    <img
                      src={checkIn.animeImage}
                      alt={checkIn.title}
                      className="checkin-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div
                    className="checkin-color"
                    style={{
                      backgroundColor: emotionColorMap[checkIn.emotion] || '#90EE90',
                      display: checkIn.animeImage ? 'none' : 'block'
                    }}
                  />
                  <div className="checkin-info">
                    <h4>{checkIn.title}</h4>
                    {checkIn.animeTitle && (
                      <p className="checkin-anime-title">{checkIn.animeTitle}</p>
                    )}
                    <p className="checkin-meta">
                      {checkIn.type} • {checkIn.emotion} • {checkIn.rating}/10
                    </p>
                    <p className="checkin-date">
                      {new Date(checkIn.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/garden" className="action-card">
              <FaSeedling />
              <span>View Garden</span>
            </Link>
            <Link to="/checkin" className="action-card">
              <FaPlus />
              <span>New Check-in</span>
            </Link>
            <Link to="/profile" className="action-card">
              <FaChartLine />
              <span>View Stats</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

