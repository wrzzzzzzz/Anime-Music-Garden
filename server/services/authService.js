const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' } // Short-lived access token
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const generateToken = (userId) => {
  // Legacy method for backward compatibility
  return generateAccessToken(userId);
};

const register = async (username, password) => {
  // 验证输入
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  if (username.length < 3 || username.length > 30) {
    throw new Error('Username must be between 3 and 30 characters');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    throw new Error('Username already taken');
  }

  const userData = { 
    username: username.trim(), 
    password 
  };
  
  console.log('Creating user with data:', { username: userData.username, hasPassword: !!userData.password });
  
  const user = new User(userData);
  
  try {
    await user.save();
    console.log('User saved successfully:', user._id);
  } catch (saveError) {
    console.error('Error saving user:', saveError);
    console.error('Error details:', saveError.message);
    console.error('Error code:', saveError.code);
    throw saveError;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();

  // Store refresh token in user document - use findByIdAndUpdate to avoid version conflicts
  await User.findByIdAndUpdate(
    user._id,
    { $push: { refreshTokens: { token: refreshToken } } },
    { new: true }
  );

  return {
    token: accessToken,
    refreshToken: refreshToken,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  };
};

const login = async (username, password) => {
  const user = await User.findOne({ username });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();

  // Store refresh token in user document - use findByIdAndUpdate to avoid version conflicts
  await User.findByIdAndUpdate(
    user._id,
    { $push: { refreshTokens: { token: refreshToken } } },
    { new: true }
  );

  return {
    token: accessToken,
    refreshToken: refreshToken,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  };
};

const refreshAccessToken = async (refreshToken) => {
  const user = await User.findOne({
    'refreshTokens.token': refreshToken
  });

  if (!user) {
    throw new Error('Invalid refresh token');
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken();

  // Remove old token and add new one atomically
  await User.findByIdAndUpdate(
    user._id,
    {
      $pull: { refreshTokens: { token: refreshToken } }
    }
  );
  await User.findByIdAndUpdate(
    user._id,
    {
      $push: { refreshTokens: { token: newRefreshToken } }
    }
  );

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  };
};

const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (user) {
    // Remove the specific refresh token
    user.refreshTokens = user.refreshTokens.filter(
      rt => rt.token !== refreshToken
    );
    await user.save();
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  generateToken,
  generateAccessToken
};

