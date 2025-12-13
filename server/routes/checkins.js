const express = require('express');
const { body } = require('express-validator');
const checkInControllers = require('../controllers/checkInControllers');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', [
  auth,
  body('type').isIn(['anime', 'opening', 'ending', 'insert']).withMessage('Invalid type'),
  body('title').optional().trim(),
  body('animeTitle').optional().trim(),
  body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
  body('emotion').isIn(['happy', 'sad', 'excited', 'calm', 'nostalgic', 'energetic', 'melancholic', 'inspired'])
    .withMessage('Invalid emotion')
], checkInControllers.createCheckIn);

router.get('/', auth, checkInControllers.getCheckIns);

router.get('/:id', auth, checkInControllers.getCheckInById);

router.put('/:id', [
  auth,
  body('rating').optional().isInt({ min: 1, max: 10 }),
  body('emotion').optional().isIn(['happy', 'sad', 'excited', 'calm', 'nostalgic', 'energetic', 'melancholic', 'inspired'])
], checkInControllers.updateCheckIn);

router.delete('/:id', auth, checkInControllers.deleteCheckIn);

module.exports = router;
