const express = require('express');
const userControllers = require('../controllers/userControllers');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

router.get('/profile', auth, userControllers.getProfile);

router.put('/profile', auth, userControllers.updateProfile);

// Admin-only routes
router.get('/admin/stats', auth, authorize('admin'), userControllers.getAdminStats);
router.get('/admin/users', auth, authorize('admin'), userControllers.getAllUsers);

module.exports = router;
