const request = require('supertest');
const { app } = require('../../server');
const axios = require('axios');

// Mock axios for anime service
jest.mock('axios');

describe('Anime Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/anime/search', () => {
    it('should search anime with valid query', async () => {
      const mockResults = [
        {
          malId: 1,
          anilistId: 1,
          title: 'Test Anime',
          titleEnglish: 'Test Anime',
          image: 'https://example.com/image.jpg'
        }
      ];

      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            Page: {
              media: [
                {
                  id: 1,
                  idMal: 1,
                  title: {
                    romaji: 'Test Anime',
                    english: 'Test Anime',
                    native: 'テスト'
                  },
                  coverImage: {
                    large: 'https://example.com/image.jpg'
                  },
                  averageScore: 85,
                  episodes: 12,
                  genres: ['Action'],
                  studios: {
                    nodes: [{ name: 'Studio Test' }]
                  }
                }
              ]
            }
          }
        }
      });

      const res = await request(app)
        .get('/api/anime/search?q=test');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    it('should return 400 if query parameter is missing', async () => {
      const res = await request(app)
        .get('/api/anime/search');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Query parameter is required');
    });

    it('should handle API errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      const res = await request(app)
        .get('/api/anime/search?q=test');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /api/anime/:id', () => {
    it('should get anime by ID', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            Media: {
              id: 1,
              idMal: 1,
              title: {
                romaji: 'Test Anime',
                english: 'Test Anime',
                native: 'テスト'
              },
              coverImage: {
                large: 'https://example.com/image.jpg'
              },
              averageScore: 85,
              episodes: 12,
              genres: ['Action'],
              studios: {
                nodes: [{ name: 'Studio Test' }]
              },
              characters: {
                nodes: []
              }
            }
          }
        }
      });

      const res = await request(app)
        .get('/api/anime/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('anime');
      expect(res.body.anime.title).toBe('Test Anime');
    });

    it('should handle API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('Anime not found'));

      const res = await request(app)
        .get('/api/anime/999');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /api/anime/:id/characters', () => {
    it('should get anime characters', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            Media: {
              id: 1,
              title: {
                romaji: 'Test Anime'
              },
              characters: {
                nodes: [
                  {
                    id: 1,
                    name: {
                      full: 'Character 1',
                      native: 'キャラ1'
                    },
                    image: {
                      large: 'https://example.com/char.jpg'
                    }
                  }
                ]
              }
            }
          }
        }
      });

      const res = await request(app)
        .get('/api/anime/1/characters');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('characters');
      expect(Array.isArray(res.body.characters)).toBe(true);
    });

    it('should handle API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      const res = await request(app)
        .get('/api/anime/1/characters');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /api/anime/:id/soundtrack', () => {
    it('should get anime soundtrack', async () => {
      // Mock getAnimeById first
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            Media: {
              id: 1,
              idMal: 1,
              title: { romaji: 'Test' }
            }
          }
        }
      });

      // Mock Jikan API
      axios.get.mockResolvedValueOnce({
        data: {
          data: {
            openings: ['Opening 1', 'Opening 2'],
            endings: ['Ending 1']
          }
        }
      });

      const res = await request(app)
        .get('/api/anime/1/soundtrack');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('soundtracks');
      expect(Array.isArray(res.body.soundtracks)).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      const res = await request(app)
        .get('/api/anime/1/soundtrack');

      expect(res.statusCode).toBe(200);
      expect(res.body.soundtracks).toEqual([]);
    });
  });
});

