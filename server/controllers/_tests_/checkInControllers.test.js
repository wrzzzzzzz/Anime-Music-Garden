const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const CheckIn = require('../../models/CheckIn');
const jwt = require('jsonwebtoken');

// Suppress console logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('CheckIn Controllers', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up completely before each test
    await CheckIn.deleteMany({});
    await User.deleteMany({});
    
    // Wait a bit to ensure database operations complete
    await new Promise(resolve => setTimeout(resolve, 150));

    const user = await User.create({
      username: `testuser_${Date.now()}`,
      password: 'password123'
    });

    userId = user._id;
    authToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    // Wait a bit to ensure user is saved
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  describe('POST /api/checkins', () => {
    it('should create a new check-in', async () => {
      const res = await request(app)
        .post('/api/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'anime',
          title: 'Attack on Titan',
          rating: 9,
          emotion: 'excited'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('checkIn');
      expect(res.body.checkIn.title).toBe('Attack on Titan');
      expect(res.body.checkIn).toHaveProperty('flowerSize');
      expect(res.body.checkIn.flowerSize).toBeCloseTo(1.85, 1);
      expect(res.body.checkIn).not.toHaveProperty('flowerColor');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/checkins')
        .send({
          type: 'anime',
          title: 'Test',
          rating: 5,
          emotion: 'happy'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'invalid',
          rating: 15,
          emotion: 'invalid'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should create check-in for music type with title', async () => {
      const res = await request(app)
        .post('/api/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'opening',
          title: 'Great Opening',
          rating: 10,
          emotion: 'excited'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.checkIn.type).toBe('opening');
      expect(res.body.checkIn.title).toBe('Great Opening');
    });

    it('should require title for music types', async () => {
      const res = await request(app)
        .post('/api/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'opening',
          rating: 8,
          emotion: 'happy'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Title is required');
    });


    it('should use animeTitle as title for anime type', async () => {
      const res = await request(app)
        .post('/api/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'anime',
          animeTitle: 'My Anime',
          rating: 9,
          emotion: 'excited'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.checkIn.title).toBe('My Anime');
    });
  });

  describe('GET /api/checkins', () => {
    beforeEach(async () => {
      // Clean up first
      await CheckIn.deleteMany({ user: userId });
      
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

    it('should get all check-ins for user', async () => {
      const res = await request(app)
        .get('/api/checkins')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('checkIns');
      expect(res.body.checkIns).toHaveLength(2);
      expect(res.body.checkIns[0]).toHaveProperty('flowerSize');
      expect(res.body.checkIns[0]).not.toHaveProperty('flowerColor');
    });

    it('should support pagination with limit and skip', async () => {
      const res = await request(app)
        .get('/api/checkins?limit=1&skip=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.checkIns).toHaveLength(1);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('skip');
    });


    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/checkins?type=anime')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.checkIns).toHaveLength(1);
      expect(res.body.checkIns[0].type).toBe('anime');
    });
  });

  describe('PUT /api/checkins/:id', () => {
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

    it('should update a check-in', async () => {
      const res = await request(app)
        .put(`/api/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 10,
          notes: 'Updated notes'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.checkIn.rating).toBe(10);
      expect(res.body.checkIn.notes).toBe('Updated notes');
      // Verify flowerSize is recalculated based on new rating
      expect(res.body.checkIn.flowerSize).toBeCloseTo(2.0, 1);
    });

    it('should validate update data', async () => {
      const res = await request(app)
        .put(`/api/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 15,
          emotion: 'invalid'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not update check-in from another user', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        password: 'password123'
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id.toString() },
        process.env.JWT_SECRET || 'your-secret-key'
      );

      const res = await request(app)
        .put(`/api/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          rating: 10
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Check-in not found');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put(`/api/checkins/${checkInId}`)
        .send({
          rating: 10
        });

      expect(res.statusCode).toBe(401);
    });

    it('should recalculate flowerSize when rating changes', async () => {
      const res = await request(app)
        .put(`/api/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.checkIn.rating).toBe(1);
      expect(res.body.checkIn.flowerSize).toBeCloseTo(0.65, 1);
    });

    it('should update emotion without recalculating size', async () => {
      const res = await request(app)
        .put(`/api/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emotion: 'sad'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.checkIn.emotion).toBe('sad');
      // Size should remain the same since rating didn't change
      expect(res.body.checkIn.flowerSize).toBeCloseTo(1.25, 1);
    });

  });

  describe('DELETE /api/checkins/:id', () => {
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

    it('should delete a check-in', async () => {
      const res = await request(app)
        .delete(`/api/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      
      const deleted = await CheckIn.findById(checkInId);
      expect(deleted).toBeNull();
    });

    it('should require authentication to delete', async () => {
      const res = await request(app)
        .delete(`/api/checkins/${checkInId}`);

      expect(res.statusCode).toBe(401);
    });

    it('should not delete check-in from another user', async () => {
      const otherUser = await User.create({
        username: 'otheruser2',
        password: 'password123'
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id.toString() },
        process.env.JWT_SECRET || 'your-secret-key'
      );

      const otherCheckIn = await CheckIn.create({
        user: otherUser._id,
        type: 'anime',
        title: 'Other Anime',
        rating: 5,
        emotion: 'sad',
        flowerSize: 1.25
      });

      const res = await request(app)
        .delete(`/api/checkins/${otherCheckIn._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/checkins/:id', () => {
    let checkInId;

    beforeEach(async () => {
      const checkIn = await CheckIn.create({
        user: userId,
        type: 'anime',
        title: 'Test Anime',
        rating: 7,
        emotion: 'happy',
        flowerSize: 1.55
      });
      checkInId = checkIn._id;
    });

    it('should get a specific check-in', async () => {
      const res = await request(app)
        .get(`/api/checkins/${checkInId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.checkIn.title).toBe('Test Anime');
      expect(res.body.checkIn).toHaveProperty('flowerSize');
    });

    it('should not get check-in from another user', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser',
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

      const res = await request(app)
        .get(`/api/checkins/${otherCheckIn._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Check-in not found');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/checkins/${checkInId}`);

      expect(res.statusCode).toBe(401);
    });

  });
});

