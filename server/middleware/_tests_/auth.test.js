const auth = require('../auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let user;
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await new Promise(resolve => setTimeout(resolve, 100));
    
    user = await User.create({
      username: 'testuser',
      password: 'password123'
    });
    await new Promise(resolve => setTimeout(resolve, 50));

    token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    mockReq = {
      header: jest.fn((name) => {
        if (name === 'Authorization') {
          return mockReq._authHeader;
        }
        return undefined;
      }),
      _authHeader: null,
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  it('should authenticate valid token', async () => {
    mockReq._authHeader = `Bearer ${token}`;

    await auth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.username).toBe('testuser');
  });

  it('should reject request without token', async () => {
    mockReq._authHeader = undefined;

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No token provided, authorization denied'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    mockReq._authHeader = 'Bearer invalid-token';

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject expired token', async () => {
    const expiredToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '-1h' }
    );

    mockReq._authHeader = `Bearer ${expiredToken}`;

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token expired'
    });
  });

  it('should reject token for non-existent user', async () => {
    const fakeToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    mockReq._authHeader = `Bearer ${fakeToken}`;

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token is not valid'
    });
  });
});

