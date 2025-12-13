const axios = require('axios');

const ANILIST_API_URL = 'https://graphql.anilist.co';

// GraphQL query for searching anime
const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description
        averageScore
        episodes
        startDate {
          year
          month
          day
        }
        genres
        studios {
          nodes {
            name
          }
        }
      }
    }
  }
`;

// GraphQL query for getting anime by ID
const GET_ANIME_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      bannerImage
      description
      averageScore
      episodes
      startDate {
        year
        month
        day
      }
      genres
      studios {
        nodes {
          name
        }
      }
      characters(perPage: 10) {
        nodes {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
        }
      }
    }
  }
`;

// Search anime using AniList API
const searchAnime = async (query) => {
  try {
    const response = await axios.post(ANILIST_API_URL, {
      query: SEARCH_ANIME_QUERY,
      variables: {
        search: query,
        page: 1,
        perPage: 10
      }
    });

    if (response.data.errors) {
      console.error('AniList API errors:', response.data.errors);
      throw new Error('API returned errors');
    }

    const media = response.data.data?.Page?.media || [];
    
    return media.map(anime => ({
      malId: anime.idMal || anime.id,
      anilistId: anime.id,
      title: anime.title.romaji || anime.title.english || anime.title.native,
      titleEnglish: anime.title.english || anime.title.romaji,
      titleJapanese: anime.title.native,
      image: anime.coverImage?.large || anime.coverImage?.medium,
      bannerImage: anime.bannerImage,
      synopsis: anime.description ? anime.description.replace(/<[^>]*>/g, '').substring(0, 200) : '',
      score: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null,
      episodes: anime.episodes,
      year: anime.startDate?.year,
      genres: anime.genres || [],
      studios: anime.studios?.nodes?.map(s => s.name) || []
    }));
  } catch (error) {
    console.error('AniList API error:', error.response?.data || error.message);
    throw new Error('Failed to search anime');
  }
};

// Get anime details by AniList ID
const getAnimeById = async (anilistId) => {
  try {
    const response = await axios.post(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables: {
        id: parseInt(anilistId)
      }
    });

    if (response.data.errors) {
      console.error('AniList API errors:', response.data.errors);
      throw new Error('API returned errors');
    }

    const anime = response.data.data?.Media;
    if (!anime) {
      throw new Error('Anime not found');
    }

    return {
      malId: anime.idMal || anime.id,
      anilistId: anime.id,
      title: anime.title.romaji || anime.title.english || anime.title.native,
      titleEnglish: anime.title.english || anime.title.romaji,
      titleJapanese: anime.title.native,
      image: anime.coverImage?.large || anime.coverImage?.medium,
      bannerImage: anime.bannerImage,
      synopsis: anime.description ? anime.description.replace(/<[^>]*>/g, '') : '',
      score: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null,
      episodes: anime.episodes,
      year: anime.startDate?.year,
      genres: anime.genres || [],
      studios: anime.studios?.nodes?.map(s => s.name) || [],
      characters: anime.characters?.nodes?.map(char => ({
        id: char.id,
        name: char.name.full,
        nameNative: char.name.native,
        image: char.image?.large || char.image?.medium
      })) || []
    };
  } catch (error) {
    console.error('AniList API error:', error.response?.data || error.message);
    throw new Error('Failed to get anime details');
  }
};

// Get anime characters (using the same query as getAnimeById)
const getAnimeCharacters = async (anilistId) => {
  try {
    const anime = await getAnimeById(anilistId);
    return anime.characters || [];
  } catch (error) {
    console.error('Get characters error:', error);
    throw new Error('Failed to get anime characters');
  }
};

// Get anime soundtrack (OP/ED) using Jikan API (MyAnimeList)
const getAnimeSoundtrack = async (malId) => {
  try {
    // First, try to get MAL ID from AniList ID if needed
    let actualMalId = malId;
    
    // If it's an AniList ID, we need to get the MAL ID first
    if (!malId || malId > 100000) {
      // Likely an AniList ID, try to get anime details to find MAL ID
      try {
        const anime = await getAnimeById(malId);
        actualMalId = anime.malId;
      } catch (err) {
        // If that fails, try using the ID directly
        actualMalId = malId;
      }
    }

    if (!actualMalId) {
      throw new Error('MAL ID not found');
    }

    // Use Jikan API to get anime themes (OP/ED)
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${actualMalId}/themes`);
    
    if (response.data && response.data.data) {
      const themes = response.data.data;
      const soundtracks = [];
      
      // Process openings
      if (themes.openings && Array.isArray(themes.openings)) {
        themes.openings.forEach((op, index) => {
          soundtracks.push({
            type: 'opening',
            title: op,
            number: index + 1
          });
        });
      }
      
      // Process endings
      if (themes.endings && Array.isArray(themes.endings)) {
        themes.endings.forEach((ed, index) => {
          soundtracks.push({
            type: 'ending',
            title: ed,
            number: index + 1
          });
        });
      }
      
      return soundtracks;
    }
    
    return [];
  } catch (error) {
    console.error('Jikan API error:', error.response?.data || error.message);
    // Return empty array instead of throwing, so the app can still work
    return [];
  }
};

module.exports = {
  searchAnime,
  getAnimeById,
  getAnimeCharacters,
  getAnimeSoundtrack
};
