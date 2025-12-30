const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { createTestUser, generateToken } = require('../helpers/testHelpers');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next() with valid token', async () => {
    const user = await createTestUser();
    const token = generateToken(user._id);
    
    req.header.mockReturnValue(`Bearer ${token}`);

    await auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe(user.email);
  });

  it('should return 401 if no token provided', async () => {
    req.header.mockReturnValue(undefined);

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.header.mockReturnValue('Bearer invalid-token');

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found', async () => {
    const mongoose = require('mongoose');
    const fakeUserId = new mongoose.Types.ObjectId();
    const token = generateToken(fakeUserId);
    req.header.mockReturnValue(`Bearer ${token}`);

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle token without Bearer prefix', async () => {
    const user = await createTestUser();
    const token = generateToken(user._id);
    
    req.header.mockReturnValue(token);

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });
});

