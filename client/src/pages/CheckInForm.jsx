import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { FaSeedling, FaMusic } from 'react-icons/fa';
import AnimeSearch from '../components/AnimeSearch';
import './CheckInForm.css';

const CheckInForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [formData, setFormData] = useState({
    type: 'anime',
    title: '',
    animeTitle: '',
    animeId: null,
    animeImage: '',
    episode: '',
    rating: 5,
    emotion: 'happy',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [soundtracks, setSoundtracks] = useState([]);
  const [loadingSoundtracks, setLoadingSoundtracks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchCheckInData();
    }
  }, [id]);

  const fetchCheckInData = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/checkins/${id}`);
      const checkIn = response.data.checkIn;
      
      setFormData({
        type: checkIn.type,
        title: checkIn.title || '',
        animeTitle: checkIn.animeTitle || '',
        animeId: checkIn.animeId || null,
        animeImage: checkIn.animeImage || '',
        episode: checkIn.episode || '',
        rating: checkIn.rating,
        emotion: checkIn.emotion,
        notes: checkIn.notes || '',
        date: new Date(checkIn.date).toISOString().split('T')[0]
      });

      if (checkIn.animeId) {
        setSelectedAnime({
          animeId: checkIn.animeId,
          animeTitle: checkIn.animeTitle,
          animeImage: checkIn.animeImage,
          title: checkIn.animeTitle
        });
      }
    } catch (error) {
      console.error('Failed to fetch check-in:', error);
      setError('Failed to load check-in data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAnimeSelect = async (anime) => {
    if (!anime) {
      setSelectedAnime(null);
      setFormData(prev => ({
        ...prev,
        animeId: null,
        animeImage: '',
        animeTitle: ''
      }));
      setSoundtracks([]);
      return;
    }

    // Ensure we have the image URL - it should come from AnimeSearch as animeImage
    const imageUrl = anime.animeImage || anime.image || '';
    
    // Create a consistent anime object
    const animeData = {
      animeId: anime.animeId,
      animeTitle: anime.animeTitle || anime.title,
      animeImage: imageUrl,
      title: anime.title || anime.animeTitle
    };
    
    setSelectedAnime(animeData);
    setFormData(prev => ({
      ...prev,
      animeId: animeData.animeId,
      animeImage: imageUrl,
      animeTitle: animeData.animeTitle
    }));

    // If type is opening/ending, fetch soundtracks
    if (formData.type === 'opening' || formData.type === 'ending') {
      await fetchSoundtracks(anime.animeId);
    }
  };

  const fetchSoundtracks = async (animeId) => {
    if (!animeId) return;
    
    setLoadingSoundtracks(true);
    try {
      const response = await api.get(`/anime/${animeId}/soundtrack`);
      setSoundtracks(response.data.soundtracks || []);
    } catch (error) {
      console.error('Failed to fetch soundtracks:', error);
      setSoundtracks([]);
    } finally {
      setLoadingSoundtracks(false);
    }
  };

  useEffect(() => {
    // When type changes to opening/ending and anime is selected, fetch soundtracks
    if ((formData.type === 'opening' || formData.type === 'ending') && selectedAnime?.animeId) {
      fetchSoundtracks(selectedAnime.animeId);
    } else if (formData.type === 'insert') {
      setSoundtracks([]);
    }
  }, [formData.type, selectedAnime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'episode' || name === 'rating' ? (value ? parseInt(value) : '') : value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ensure animeImage is properly set
      const animeImageValue = formData.animeImage && formData.animeImage.trim() !== '' 
        ? formData.animeImage.trim() 
        : undefined;
      
      const payload = {
        ...formData,
        episode: formData.episode || undefined,
        animeId: formData.animeId || undefined,
        animeImage: animeImageValue,
      };
      

      // For anime type, set title to animeTitle if title is empty
      if (formData.type === 'anime' && !formData.title && formData.animeTitle) {
        payload.title = formData.animeTitle;
      }

      if (isEditMode) {
        await api.put(`/checkins/${id}`, payload);
      } else {
        await api.post('/checkins', payload);
      }
      navigate('/garden');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          'Failed to create check-in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const emotionOptions = [
    { value: 'happy', label: 'Happy', emoji: '😊', color: '#FFD700' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: '#4169E1' },
    { value: 'excited', label: 'Excited', emoji: '🤩', color: '#FF6347' },
    { value: 'calm', label: 'Calm', emoji: '😌', color: '#98D8C8' },
    { value: 'nostalgic', label: 'Nostalgic', emoji: '🥺', color: '#DDA0DD' },
    { value: 'energetic', label: 'Energetic', emoji: '⚡', color: '#FF4500' },
    { value: 'melancholic', label: 'Melancholic', emoji: '🌙', color: '#9370DB' },
    { value: 'inspired', label: 'Inspired', emoji: '✨', color: '#00CED1' }
  ];

  if (loadingData) {
    return (
      <div className="checkin-form-page">
        <div className="form-container">
          <div className="form-loading">Loading check-in data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-form-page">
      <div className="form-container">
        <div className="form-header">
          <div className="form-icon-wrapper">
            <FaSeedling className="form-icon" />
            <FaMusic className="form-icon-music" />
          </div>
          <h1>{isEditMode ? 'Edit Flower' : 'Plant a New Flower'}</h1>
          <p>{isEditMode ? 'Update your check-in details' : 'Log your anime or music experience'}</p>
        </div>

        <form onSubmit={handleSubmit} className="checkin-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="anime">Anime Episode</option>
                <option value="opening">Opening Theme</option>
                <option value="ending">Ending Theme</option>
                <option value="insert">Insert Song</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.type === 'anime' && (
            <>
              <div className="form-group">
                <label htmlFor="animeTitle">Anime Title *</label>
                <AnimeSearch
                  onSelect={handleAnimeSelect}
                  type="anime"
                  selectedAnime={selectedAnime}
                />
                {!selectedAnime && (
                  <p className="form-hint" style={{ color: '#f59e0b', marginTop: '0.5rem' }}>
                    ⚠️ Please search and select an anime from the dropdown to display its image in the garden
                  </p>
                )}
                {selectedAnime && selectedAnime.animeImage && (
                  <p className="form-hint" style={{ color: '#10b981', marginTop: '0.5rem' }}>
                    ✅ Anime image will be displayed in your garden
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="episode">Episode Number</label>
                <input
                  type="number"
                  id="episode"
                  name="episode"
                  value={formData.episode}
                  onChange={handleChange}
                  min="1"
                  placeholder="Episode number"
                />
              </div>
            </>
          )}

          {(formData.type === 'opening' || formData.type === 'ending' || formData.type === 'insert') && (
            <>
              <div className="form-group">
                <label htmlFor="animeTitle">Anime Title *</label>
                <AnimeSearch
                  onSelect={handleAnimeSelect}
                  type={formData.type}
                  selectedAnime={selectedAnime}
                />
                {!selectedAnime && (
                  <p className="form-hint" style={{ color: '#f59e0b', marginTop: '0.5rem' }}>
                    ⚠️ Please search and select an anime from the dropdown to display its image in the garden
                  </p>
                )}
                {selectedAnime && selectedAnime.animeImage && (
                  <p className="form-hint" style={{ color: '#10b981', marginTop: '0.5rem' }}>
                    ✅ Anime image will be displayed in your garden
                  </p>
                )}
              </div>
              {(formData.type === 'opening' || formData.type === 'ending') && selectedAnime && (
                <div className="form-group">
                  <label htmlFor="songTitle">Song Title *</label>
                  {loadingSoundtracks ? (
                    <div className="loading-soundtracks">Loading songs...</div>
                  ) : soundtracks.length > 0 ? (
                    <select
                      id="songTitle"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select a song...</option>
                      {soundtracks
                        .filter(s => s.type === formData.type)
                        .map((song, index) => (
                          <option key={index} value={song.title}>
                            {song.title}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="songTitle"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter song title manually"
                    />
                  )}
                </div>
              )}
              {formData.type === 'insert' && (
                <div className="form-group">
                  <label htmlFor="title">Song Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter song title, e.g., Guren no Yumiya"
                  />
                </div>
              )}
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rating">Rating * (1-10)</label>
              <div className="rating-input">
                <input
                  type="range"
                  id="rating"
                  name="rating"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  className="rating-slider"
                />
                <span className="rating-value">{formData.rating}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emotion">Emotion *</label>
            <div className="emotion-grid">
              {emotionOptions.map((emotion) => (
                <label key={emotion.value} className="emotion-option">
                  <input
                    type="radio"
                    name="emotion"
                    value={emotion.value}
                    checked={formData.emotion === emotion.value}
                    onChange={handleChange}
                    required
                  />
                  <div
                    className="emotion-card"
                    style={{
                      borderColor: formData.emotion === emotion.value ? emotion.color : 'transparent',
                      background: formData.emotion === emotion.value 
                        ? `linear-gradient(135deg, ${emotion.color}20, ${emotion.color}10)`
                        : 'var(--background)'
                    }}
                  >
                    <span className="emotion-emoji">{emotion.emoji}</span>
                    <span className="emotion-label">{emotion.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              maxLength={500}
              placeholder="Share your thoughts about this experience..."
            />
            <span className="char-count">{formData.notes.length}/500</span>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading || loadingData}>
              {loading ? (isEditMode ? 'Updating...' : 'Planting...') : (isEditMode ? 'Update Flower ✏️' : 'Plant Flower 🌸')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInForm;
