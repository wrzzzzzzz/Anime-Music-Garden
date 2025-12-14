const userService = require('../userService');
const User = require('../../models/User');
const CheckIn = require('../../models/CheckIn');
const mongoose = require('mongoose');

describe('User Service', () => {
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up completely before each test
    await CheckIn.deleteMany({});
    await User.deleteMany({});
    await new Promise(resolve => setTimeout(resolve, 150));

    const user = await User.create({
      username: `testuser_${Date.now()}`, // Use unique username
      password: 'password123'
    });
    userId = user._id;
    
    // Verify user was created
    const verifyUser = await User.findById(userId);
    if (!verifyUser) {
      throw new Error('User was not created properly');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('getProfile', () => {
    it('should get user profile with stats', async () => {
      // Create check-ins
      await CheckIn.create([
        {
          user: userId,
          type: 'anime',
          title: 'Anime 1',
          rating: 8,
          emotion: 'happy',
          flowerSize: 1.7
        },
        {
          user: userId,
          type: 'opening',
          title: 'OP 1',
          rating: 9,
          emotion: 'excited',
          flowerSize: 1.85
        }
      ]);

      const result = await userService.getProfile(userId);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('stats');
      expect(result.stats.totalCheckIns).toBe(2);
      expect(result.stats.checkInsByType.anime).toBe(1);
      expect(result.stats.checkInsByType.opening).toBe(1);
      expect(result.stats.averageRating).toBe('8.50');
    });

    it('should handle user with no check-ins', async () => {
      const result = await userService.getProfile(userId);

      expect(result.stats.totalCheckIns).toBe(0);
      expect(result.stats.averageRating).toBe('0');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = { username: 'newusername' };
      const result = await userService.updateProfile(userId, updateData);

      expect(result.username).toBe('newusername');
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { username: 'newusername' };

      await expect(userService.updateProfile(fakeId, updateData)).rejects.toThrow('User not found');
    });
  });
});

