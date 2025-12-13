import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './AnimeSearch.css';

const AnimeSearch = ({ onSelect, type = 'anime', selectedAnime = null }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (selectedAnime) {
      setQuery(selectedAnime.title || selectedAnime.animeTitle || '');
    }
  }, [selectedAnime]);

  useEffect(() => {
    // Close results when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAnime = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/anime/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search anime:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear timeout if exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchAnime(value);
    }, 300);
  };

  const handleSelect = (anime) => {
    setQuery(anime.title);
    setShowResults(false);
    if (onSelect) {
      onSelect({
        animeId: anime.anilistId || anime.malId,
        animeTitle: anime.title,
        animeImage: anime.image, // This is the image from AniList API
        title: anime.title
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (onSelect) {
      onSelect(null);
    }
  };

  return (
    <div className="anime-search" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={type === 'anime' ? 'Search anime...' : 'Search anime (for OP/ED)...'}
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {query && (
          <button type="button" className="clear-button" onClick={handleClear}>
            ×
          </button>
        )}
      </div>

      {loading && (
        <div className="search-loading">Searching...</div>
      )}

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((anime) => (
            <div
              key={anime.anilistId || anime.malId}
              className="search-result-item"
              onClick={() => handleSelect(anime)}
            >
              {anime.image && (
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="result-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="result-info">
                <div className="result-title">{anime.title}</div>
                {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                  <div className="result-title-english">{anime.titleEnglish}</div>
                )}
                {anime.score && (
                  <div className="result-score">⭐ {anime.score}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAnime && selectedAnime.animeImage && (
        <div className="selected-anime">
          <img
            src={selectedAnime.animeImage}
            alt={selectedAnime.animeTitle || selectedAnime.title}
            className="selected-image"
          />
          <div className="selected-info">
            <div className="selected-title">{selectedAnime.animeTitle || selectedAnime.title}</div>
            {selectedAnime.score && (
              <div className="selected-score">⭐ {selectedAnime.score}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeSearch;

