const userService = require('../services/userService');

const getProfile = async (req, res) => {
  try {
    const result = await userService.getProfile(req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const updateData = {};

    if (username) updateData.username = username;

    const user = await userService.updateProfile(req.user._id, updateData);

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const CheckIn = require('../models/CheckIn');

    const totalUsers = await User.countDocuments();
    const totalCheckIns = await CheckIn.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      stats: {
        totalUsers,
        totalCheckIns,
        recentUsers,
        averageCheckInsPerUser: totalUsers > 0 ? (totalCheckIns / totalUsers).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAdminStats,
  getAllUsers
};

