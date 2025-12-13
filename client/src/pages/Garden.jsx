import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import Flower from '../components/Flower';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import './Garden.css';

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

const Garden = () => {
  const navigate = useNavigate();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterEmotion, setFilterEmotion] = useState('all');
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const gardenRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchCheckIns();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchCheckIns = async () => {
    try {
      const response = await api.get('/checkins?limit=200');
      setCheckIns(response.data.checkIns);
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      // Use environment variable or default to localhost for development
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      socketRef.current = io(socketUrl, {
        auth: { token }
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket');
        // Join user's garden room
        try {
          const userId = JSON.parse(atob(token.split('.')[1])).userId;
          socketRef.current.emit('join-garden', userId);
        } catch (err) {
          console.error('Error parsing token:', err);
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current.on('new-flower', (data) => {
        if (data.checkIn) {
          setCheckIns((prev) => [data.checkIn, ...prev]);
        }
      });

      socketRef.current.on('flower-removed', (data) => {
        if (data.checkInId) {
          setCheckIns((prev) => prev.filter((ci) => ci._id !== data.checkInId));
        }
      });

      socketRef.current.on('flower-updated', (data) => {
        if (data.checkIn) {
          setCheckIns((prev) => 
            prev.map((ci) => ci._id === data.checkIn._id ? data.checkIn : ci)
          );
        }
      });
    } catch (error) {
      console.error('Error setting up socket:', error);
    }
  };

  const handleFlowerClick = (checkIn) => {
    setSelectedFlower(checkIn);
  };

  const handleDeleteCheckIn = async () => {
    if (!selectedFlower || !window.confirm('Are you sure you want to delete this check-in?')) {
      return;
    }

    try {
      await api.delete(`/checkins/${selectedFlower._id}`);
      setCheckIns((prev) => prev.filter((ci) => ci._id !== selectedFlower._id));
      setSelectedFlower(null);
    } catch (error) {
      console.error('Failed to delete check-in:', error);
      alert('Failed to delete check-in. Please try again.');
    }
  };

  const handleEditCheckIn = () => {
    if (selectedFlower) {
      navigate(`/checkin/edit/${selectedFlower._id}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedFlower(null);
  };

  // Filter check-ins based on search and filters
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter(checkIn => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          checkIn.title?.toLowerCase().includes(query) ||
          checkIn.animeTitle?.toLowerCase().includes(query) ||
          checkIn.notes?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filterType !== 'all' && checkIn.type !== filterType) {
        return false;
      }

      // Emotion filter
      if (filterEmotion !== 'all' && checkIn.emotion !== filterEmotion) {
        return false;
      }

      // Rating filter
      if (checkIn.rating < filterMinRating) {
        return false;
      }

      return true;
    });
  }, [checkIns, searchQuery, filterType, filterEmotion, filterMinRating]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterEmotion('all');
    setFilterMinRating(0);
  };

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterEmotion !== 'all' || filterMinRating > 0;

  if (loading) {
    return <div className="garden-loading">Loading your garden...</div>;
  }

  return (
    <div className="garden-page">
      <div className="garden-header">
        <h1>Your Digital Garden</h1>
        <p>Each flower represents a moment in your anime music journey</p>
      </div>

      <div className="garden-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, anime, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="anime">Anime</option>
              <option value="opening">Opening</option>
              <option value="ending">Ending</option>
              <option value="insert">Insert</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Emotion</label>
            <select
              value={filterEmotion}
              onChange={(e) => setFilterEmotion(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Emotions</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="excited">Excited</option>
              <option value="calm">Calm</option>
              <option value="nostalgic">Nostalgic</option>
              <option value="energetic">Energetic</option>
              <option value="melancholic">Melancholic</option>
              <option value="inspired">Inspired</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Rating: {filterMinRating}</label>
            <input
              type="range"
              min="0"
              max="10"
              value={filterMinRating}
              onChange={(e) => setFilterMinRating(parseInt(e.target.value))}
              className="rating-filter"
            />
          </div>

          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              <FaTimes /> Clear All
            </button>
          )}
        </div>
      )}

      {hasActiveFilters && (
        <div className="filter-info">
          Showing {filteredCheckIns.length} of {checkIns.length} flowers
        </div>
      )}

      <div className="garden-container" ref={gardenRef}>
        {checkIns.length === 0 ? (
          <div className="empty-garden">
            <p>Your garden is empty. Start adding check-ins to see flowers bloom!</p>
          </div>
        ) : filteredCheckIns.length === 0 ? (
          <div className="empty-garden">
            <p>No flowers match your filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="garden-canvas" id="garden-canvas">
            {filteredCheckIns.map((checkIn) => (
              <Flower
                key={checkIn._id}
                checkIn={checkIn}
                onClick={() => handleFlowerClick(checkIn)}
                allCheckIns={filteredCheckIns}
              />
            ))}
          </div>
        )}
      </div>

      {selectedFlower && (
        <div className="flower-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-actions">
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-header">
              {selectedFlower.animeImage ? (
                <img
                  src={selectedFlower.animeImage}
                  alt={selectedFlower.title}
                  className="modal-anime-image"
                />
              ) : (
                <div
                  className="modal-flower-preview"
                  style={{ 
                    backgroundColor: emotionColorMap[selectedFlower.emotion] || '#90EE90' 
                  }}
                />
              )}
              <div className="modal-title-section">
                <h2>{selectedFlower.title}</h2>
                {selectedFlower.animeTitle && (
                  <p className="modal-anime-title">{selectedFlower.animeTitle}</p>
                )}
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{selectedFlower.type}</span>
                </div>
                {selectedFlower.animeTitle && (
                  <div className="info-item">
                    <span className="info-label">Anime:</span>
                    <span className="info-value">{selectedFlower.animeTitle}</span>
                  </div>
                )}
                {selectedFlower.episode && (
                  <div className="info-item">
                    <span className="info-label">Episode:</span>
                    <span className="info-value">{selectedFlower.episode}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Rating:</span>
                  <span className="info-value">{selectedFlower.rating}/10</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Emotion:</span>
                  <span className="info-value">{selectedFlower.emotion}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date:</span>
                  <span className="info-value">
                    {new Date(selectedFlower.date).toLocaleDateString()}
                  </span>
                </div>
                {selectedFlower.notes && (
                  <div className="info-item notes">
                    <span className="info-label">Notes:</span>
                    <p className="info-value">{selectedFlower.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-edit-button" 
                onClick={handleEditCheckIn}
              >
                ✏️ Edit
              </button>
              <button 
                className="modal-delete-button" 
                onClick={handleDeleteCheckIn}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Garden;

