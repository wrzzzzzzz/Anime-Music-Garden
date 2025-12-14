const checkInService = require('../checkInService');
const CheckIn = require('../../models/CheckIn');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('CheckIn Service', () => {
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
      username: `testuser_${Date.now()}`,
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

  describe('createCheckIn', () => {
    it('should create check-in with flowerSize based on rating', async () => {
      const checkInData = {
        type: 'anime',
        title: 'Test Anime',
        rating: 8,
        emotion: 'happy'
      };

      const checkIn = await checkInService.createCheckIn(userId, checkInData);

      expect(checkIn.flowerSize).toBeCloseTo(1.7, 1);
      expect(checkIn).not.toHaveProperty('flowerColor');
    });

    it('should handle animeImage', async () => {
      const checkInData = {
        type: 'anime',
        title: 'Test Anime',
        rating: 8,
        emotion: 'happy',
        animeImage: 'https://example.com/image.jpg'
      };

      const checkIn = await checkInService.createCheckIn(userId, checkInData);
      expect(checkIn.animeImage).toBe('https://example.com/image.jpg');
    });

    it('should update user garden', async () => {
      const checkInData = {
        type: 'anime',
        title: 'Test Anime',
        rating: 8,
        emotion: 'happy'
      };

      await checkInService.createCheckIn(userId, checkInData);

      const user = await User.findById(userId);
      expect(user.garden.totalCheckIns).toBe(1);
      expect(user.garden.flowers.length).toBe(1);
    });
  });

  describe('getCheckIns', () => {
    beforeEach(async () => {
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
    });

    it('should get all check-ins', async () => {
      const result = await checkInService.getCheckIns(userId);

      expect(result.checkIns).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by type', async () => {
      const result = await checkInService.getCheckIns(userId, { type: 'anime' });

      expect(result.checkIns).toHaveLength(1);
      expect(result.checkIns[0].type).toBe('anime');
    });

    it('should support pagination', async () => {
      const result = await checkInService.getCheckIns(userId, { limit: 1, skip: 0 });

      expect(result.checkIns).toHaveLength(1);
      expect(result.limit).toBe(1);
      expect(result.skip).toBe(0);
    });
  });

  describe('getCheckInById', () => {
    let checkInId;

    beforeEach(async () => {
      const checkIn = await CheckIn.create({
        user: userId,
        type: 'anime',
        title: 'Test Anime',
        rating: 8,
        emotion: 'happy',
        flowerSize: 1.7
      });
      checkInId = checkIn._id;
    });

    it('should get check-in by id', async () => {
      const checkIn = await checkInService.getCheckInById(checkInId, userId);

      expect(checkIn.title).toBe('Test Anime');
    });

    it('should throw error if check-in not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(checkInService.getCheckInById(fakeId, userId)).rejects.toThrow('Check-in not found');
    });

    it('should throw error if check-in belongs to another user', async () => {
      const otherUser = await User.create({
        username: `otheruser_${Date.now()}`,
        password: 'password123'
      });

      const otherCheckIn = await CheckIn.create({
        user: otherUser._id,
        type: 'anime',
        title: 'Other Anime',
        rating: 5,
        emotion: 'sad',
        flowerSize: 1.25
      });

      await expect(checkInService.getCheckInById(otherCheckIn._id, userId)).rejects.toThrow('Check-in not found');
    });
  });

  describe('updateCheckIn', () => {
    let checkInId;

    beforeEach(async () => {
      const checkIn = await CheckIn.create({
        user: userId,
        type: 'anime',
        title: 'Test Anime',
        rating: 5,
        emotion: 'happy',
        flowerSize: 1.25
      });
      checkInId = checkIn._id;
    });

    it('should update check-in', async () => {
      const updated = await checkInService.updateCheckIn(checkInId, userId, {
        rating: 10,
        notes: 'Updated'
      });

      expect(updated.rating).toBe(10);
      expect(updated.notes).toBe('Updated');
      expect(updated.flowerSize).toBeCloseTo(2.0, 1);
    });

    it('should recalculate flowerSize when rating changes', async () => {
      const updated = await checkInService.updateCheckIn(checkInId, userId, {
        rating: 1
      });

      expect(updated.flowerSize).toBeCloseTo(0.65, 1);
    });

    it('should throw error if check-in not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(checkInService.updateCheckIn(fakeId, userId, { rating: 10 })).rejects.toThrow('Check-in not found');
    });
  });

  describe('deleteCheckIn', () => {
    let checkInId;

    beforeEach(async () => {
      // Ensure user exists - retry if needed
      let user = await User.findById(userId);
      if (!user) {
        // Retry finding user
        await new Promise(resolve => setTimeout(resolve, 100));
        user = await User.findById(userId);
      }
      if (!user) {
        // Recreate user if it was deleted
        user = await User.create({
          username: `testuser_${Date.now()}`,
          password: 'password123'
        });
        userId = user._id;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const checkIn = await CheckIn.create({
        user: userId,
        type: 'anime',
        title: 'Test Anime',
        rating: 5,
        emotion: 'happy',
        flowerSize: 1.25
      });
      checkInId = checkIn._id;
      await new Promise(resolve => setTimeout(resolve, 50));

      // Update user garden - retry if needed
      user = await User.findById(userId);
      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 100));
        user = await User.findById(userId);
      }
      if (!user) {
        throw new Error('User not found');
      }
      if (!user.garden) {
        user.garden = { flowers: [], totalCheckIns: 0 };
      }
      user.garden.flowers.push(checkIn._id);
      user.garden.totalCheckIns = 1;
      await user.save();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should delete check-in', async () => {
      await checkInService.deleteCheckIn(checkInId, userId);

      const deleted = await CheckIn.findById(checkInId);
      expect(deleted).toBeNull();
    });

    it('should update user garden after deletion', async () => {
      await checkInService.deleteCheckIn(checkInId, userId);

      const user = await User.findById(userId);
      expect(user.garden.totalCheckIns).toBe(0);
      expect(user.garden.flowers.length).toBe(0);
    });

    it('should throw error if check-in not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(checkInService.deleteCheckIn(fakeId, userId)).rejects.toThrow('Check-in not found');
    });
  });
});

