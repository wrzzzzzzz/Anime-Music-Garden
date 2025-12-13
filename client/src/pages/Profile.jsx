import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaChartBar, FaStar, FaSeedling, FaMusic } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data.user);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile & Statistics</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              <FaSeedling />
            </div>
            <div className="profile-details">
              <h2>{profile?.username}</h2>
              <p className="member-since">
                Member since {new Date(profile?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2>Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                <FaSeedling />
              </div>
              <div className="stat-details">
                <h3>{stats?.totalCheckIns || 0}</h3>
                <p>Total Check-ins</p>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                <FaChartBar />
              </div>
              <div className="stat-details">
                <h3>{stats?.checkInsByType?.anime || 0}</h3>
                <p>Anime Episodes</p>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
                <FaMusic />
              </div>
              <div className="stat-details">
                <h3>{(stats?.checkInsByType?.opening || 0) + (stats?.checkInsByType?.ending || 0) + (stats?.checkInsByType?.insert || 0)}</h3>
                <p>Music Tracks</p>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
                <FaStar />
              </div>
              <div className="stat-details">
                <h3>{stats?.averageRating || '0.0'}</h3>
                <p>Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {stats?.checkInsByType && (
          <div className="type-breakdown">
            <h2>Check-ins by Type</h2>
            <div className="breakdown-list">
              {Object.entries(stats.checkInsByType).map(([type, count]) => (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-type">{type}</span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${(count / stats.totalCheckIns) * 100}%`
                      }}
                    />
                  </div>
                  <span className="breakdown-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

