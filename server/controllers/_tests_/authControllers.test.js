const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app } = require('../../server');
const User = require('../../models/User');

describe('Authentication Controllers', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await new Promise(resolve => setTimeout(resolve, 150));
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should not register with duplicate username', async () => {
      await User.create({
        username: 'existing',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existing',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Username already taken');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return refreshToken on registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role');
    });

    it('should handle missing username or password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Clean up first
      await User.deleteMany({ username: 'loginuser' });
      
      await User.create({
        username: 'loginuser',
        password: 'password123'
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe('loginuser');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: ''
        });

      expect(res.statusCode).toBe(400);
    });

    it('should handle missing username or password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      await User.deleteMany({ username: 'meuser' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const user = await User.create({
        username: 'meuser',
        password: 'password123'
      });
      userId = user._id;
      const jwt = require('jsonwebtoken');
      authToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'your-secret-key'
      );
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should get current user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe('meuser');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('should handle invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });

    it('should handle expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: userId.toString() },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '-1h' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
    });

    it('should handle server errors', async () => {
      // Use invalid user ID to trigger error
      const invalidToken = jwt.sign(
        { userId: new mongoose.Types.ObjectId().toString() },
        process.env.JWT_SECRET || 'your-secret-key'
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;
    let testUser;

    beforeEach(async () => {
      // Clean up first
      await User.deleteMany({ username: 'refreshtest' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const user = await User.create({
        username: 'refreshtest',
        password: 'password123'
      });
      const authService = require('../../services/authService');
      const result = await authService.login('refreshtest', 'password123');
      refreshToken = result.refreshToken;
    });

    it('should refresh access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.token).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should require refreshToken', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Refresh token is required');
    });

    it('should handle server errors', async () => {
      // Mock authService to throw error
      const originalRefreshAccessToken = require('../../services/authService').refreshAccessToken;
      const authService = require('../../services/authService');
      const originalMethod = authService.refreshAccessToken;
      authService.refreshAccessToken = jest.fn().mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'some-token'
        });

      expect(res.statusCode).toBe(401);

      // Restore
      authService.refreshAccessToken = originalMethod;
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;
    let refreshToken;
    let userId;

    beforeEach(async () => {
      // Clean up first
      await User.deleteMany({ username: 'logoutuser' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const user = await User.create({
        username: 'logoutuser',
        password: 'password123'
      });
      userId = user._id;
      authToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'your-secret-key'
      );
      const authService = require('../../services/authService');
      const result = await authService.login('logoutuser', 'password123');
      refreshToken = result.refreshToken;
    });

    it('should logout and invalidate refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          refreshToken: refreshToken
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
      
      // Verify refresh token is invalidated
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(refreshRes.statusCode).toBe(401);
    });

    it('should logout without refreshToken', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(200);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: refreshToken
        });

      expect(res.statusCode).toBe(401);
    });
  });
});

