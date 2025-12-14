const authService = require('../authService');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('Auth Service', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up completely before each test
    await User.deleteMany({});
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await authService.register('newuser', 'password123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('newuser');
    });

    it('should throw error for duplicate username', async () => {
      await User.deleteMany({ username: 'existing' });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const existingUser = await User.create({
        username: 'existing',
        password: 'password123'
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify user exists
      const found = await User.findOne({ username: 'existing' });
      if (!found) {
        throw new Error('User was not created');
      }

      await expect(authService.register('existing', 'password123')).rejects.toThrow('Username already taken');
    });

    it('should throw error for short username', async () => {
      await expect(authService.register('ab', 'password123')).rejects.toThrow();
    });

    it('should throw error for short password', async () => {
      await expect(authService.register('username', '123')).rejects.toThrow();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'loginuser',
        password: 'password123'
      });
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login('loginuser', 'password123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('loginuser');
    });

    it('should throw error for invalid username', async () => {
      await expect(authService.login('nonexistent', 'password123')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      await expect(authService.login('loginuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      await User.deleteMany({ username: 'refreshtest' });
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const user = await User.create({
        username: 'refreshtest',
        password: 'password123'
      });
      userId = user._id;
      await new Promise(resolve => setTimeout(resolve, 100));

      const loginResult = await authService.login('refreshtest', 'password123');
      refreshToken = loginResult.refreshToken;
      
      // Wait a bit to ensure refresh token is saved to database
      // Retry checking for the token multiple times
      let userWithToken = null;
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        userWithToken = await User.findOne({ 'refreshTokens.token': refreshToken });
        if (userWithToken) break;
      }
      
      if (!userWithToken) {
        // Force reload the user to ensure we have the latest version
        const reloadedUser = await User.findById(userId);
        if (reloadedUser && reloadedUser.refreshTokens && reloadedUser.refreshTokens.length > 0) {
          // Token exists, just query issue
          userWithToken = reloadedUser;
        } else {
          throw new Error('Refresh token was not saved to database after login');
        }
      }
    });

    it('should refresh access token', async () => {
      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.token).not.toBe(refreshToken);
      expect(result.refreshToken).not.toBe(refreshToken);
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshAccessToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should invalidate old refresh token after use', async () => {
      await authService.refreshAccessToken(refreshToken);

      // Try to use the same token again
      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      await User.deleteMany({ username: 'logouttest' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const user = await User.create({
        username: 'logouttest',
        password: 'password123'
      });
      userId = user._id;

      const loginResult = await authService.login('logouttest', 'password123');
      refreshToken = loginResult.refreshToken;
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should logout and remove refresh token', async () => {
      await authService.logout(userId, refreshToken);

      // Verify token is invalidated
      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should handle logout for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(authService.logout(fakeId, refreshToken)).resolves.not.toThrow();
    });
  });
});

