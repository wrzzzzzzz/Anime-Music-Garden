const authorize = require('../authorize');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('Authorize Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  beforeEach(() => {
    mockReq = {
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  it('should allow access for authorized role', async () => {
    const user = await User.create({
      username: 'adminuser',
      password: 'password123',
      role: 'admin'
    });

    mockReq.user = {
      _id: user._id,
      role: 'admin'
    };

    const middleware = authorize('admin');
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should deny access for unauthorized role', async () => {
    const user = await User.create({
      username: 'regularuser',
      password: 'password123',
      role: 'user'
    });

    mockReq.user = {
      _id: user._id,
      role: 'user'
    };

    const middleware = authorize('admin');
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Access denied. Insufficient permissions.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should require authentication', () => {
    mockReq.user = null;

    const middleware = authorize('admin');
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Authentication required'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow multiple roles', async () => {
    const user = await User.create({
      username: 'adminuser2',
      password: 'password123',
      role: 'admin'
    });

    mockReq.user = {
      _id: user._id,
      role: 'admin'
    };

    const middleware = authorize('admin', 'moderator');
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

