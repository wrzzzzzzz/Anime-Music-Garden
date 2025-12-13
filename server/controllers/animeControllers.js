const animeService = require('../services/animeService');

const searchAnime = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    const results = await animeService.searchAnime(q);
    res.json({ results });
  } catch (error) {
    console.error('Search anime error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getAnimeById = async (req, res) => {
  try {
    const { id } = req.params;
    // Try AniList ID first, then fallback to MAL ID
    const anime = await animeService.getAnimeById(id);
    res.json({ anime });
  } catch (error) {
    console.error('Get anime error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getAnimeCharacters = async (req, res) => {
  try {
    const { id } = req.params;
    const characters = await animeService.getAnimeCharacters(id);
    res.json({ characters });
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getAnimeSoundtrack = async (req, res) => {
  try {
    const { id } = req.params;
    const soundtracks = await animeService.getAnimeSoundtrack(id);
    res.json({ soundtracks });
  } catch (error) {
    console.error('Get soundtrack error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  searchAnime,
  getAnimeById,
  getAnimeCharacters,
  getAnimeSoundtrack
};

