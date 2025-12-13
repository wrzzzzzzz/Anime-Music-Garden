const express = require('express');
const animeControllers = require('../controllers/animeControllers');
const router = express.Router();

router.get('/search', animeControllers.searchAnime);
router.get('/:id/soundtrack', animeControllers.getAnimeSoundtrack);
router.get('/:id/characters', animeControllers.getAnimeCharacters);
router.get('/:id', animeControllers.getAnimeById);

module.exports = router;
