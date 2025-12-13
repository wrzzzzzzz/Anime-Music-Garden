const express = require('express');
const { body } = require('express-validator');
const authControllers = require('../controllers/authControllers');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], authControllers.register);

router.post('/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], authControllers.login);

router.get('/me', auth, authControllers.getCurrentUser);

router.post('/refresh', authControllers.refreshToken);

router.post('/logout', auth, authControllers.logout);

module.exports = router;
