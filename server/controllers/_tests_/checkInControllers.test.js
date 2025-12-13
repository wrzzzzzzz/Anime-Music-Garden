const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const CheckIn = require('../../models/CheckIn');
const jwt = require('jsonwebtoken');

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
    await User.deleteMany({});
    await CheckIn.deleteMany({});

    const user = await User.create({
      username: 'testuser',
      password: 'password123'
    });

    userId = user._id;
    authToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key'
    );
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
  });

  describe('GET /api/checkins', () => {
    beforeEach(async () => {
      await CheckIn.create([
        {
          user: userId,
          type: 'anime',
          title: 'Anime 1',
          rating: 8,
          emotion: 'happy'
        },
        {
          user: userId,
          type: 'opening',
          title: 'OP 1',
          rating: 9,
          emotion: 'excited'
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
        emotion: 'happy'
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
        emotion: 'happy'
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
  });
});

