const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const CheckIn = require('../../models/CheckIn');
const jwt = require('jsonwebtoken');

describe('User Controllers', () => {
  let authToken;
  let userId;
  let adminToken;
  let adminId;

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
    
    // Wait a bit to ensure database operations complete
    await new Promise(resolve => setTimeout(resolve, 150));

    // Create regular user
    const user = await User.create({
      username: `testuser_${Date.now()}`,
      password: 'password123'
    });
    userId = user._id;
    authToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Create admin user
    const admin = await User.create({
      username: `admin_${Date.now()}`,
      password: 'password123',
      role: 'admin'
    });
    adminId = admin._id;
    adminToken = jwt.sign(
      { userId: admin._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    // Wait a bit to ensure users are saved and can be found
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Verify users exist
    const verifyUser = await User.findById(userId);
    const verifyAdmin = await User.findById(adminId);
    if (!verifyUser || !verifyAdmin) {
      throw new Error('Users were not created properly');
    }
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with stats', async () => {
      // Create some check-ins for the user
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

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats.totalCheckIns).toBe(2);
      expect(res.body.stats.checkInsByType).toHaveProperty('anime');
      expect(res.body.stats.checkInsByType).toHaveProperty('opening');
      expect(parseFloat(res.body.stats.averageRating)).toBeCloseTo(8.5, 1);
    });

    it('should handle user with no check-ins', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.stats.totalCheckIns).toBe(0);
      expect(res.body.stats.averageRating).toBe('0');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.statusCode).toBe(401);
    });

  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'newusername'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.user.username).toBe('newusername');
    });

    it('should not update with duplicate username', async () => {
      // Create another user
      await User.create({
        username: 'existing',
        password: 'password123'
      });

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'existing'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Username already taken');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({
          username: 'newusername'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/admin/stats', () => {
    beforeEach(async () => {
      // Clean up first
      await CheckIn.deleteMany({});
      
      // Create some test data
      await CheckIn.create([
        {
          user: userId,
          type: 'anime',
          title: 'Anime 1',
          rating: 8,
          emotion: 'happy',
          flowerSize: 1.7
        }
      ]);
    });

    it('should get admin stats', async () => {
      const res = await request(app)
        .get('/api/users/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats).toHaveProperty('totalUsers');
      expect(res.body.stats).toHaveProperty('totalCheckIns');
      expect(res.body.stats).toHaveProperty('recentUsers');
      expect(res.body.stats).toHaveProperty('averageCheckInsPerUser');
    });

    it('should require admin role', async () => {
      const res = await request(app)
        .get('/api/users/admin/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/users/admin/stats');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/admin/users', () => {
    it('should get all users for admin', async () => {
      const res = await request(app)
        .get('/api/users/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should require admin role', async () => {
      // Create a fresh token for the regular user
      const regularUser = await User.findById(userId);
      if (!regularUser) {
        throw new Error('Regular user not found');
      }
      const regularToken = jwt.sign(
        { userId: regularUser._id.toString() },
        process.env.JWT_SECRET || 'your-secret-key'
      );
      
      const res = await request(app)
        .get('/api/users/admin/users')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/users/admin/users');

      expect(res.statusCode).toBe(401);
    });
  });
});

