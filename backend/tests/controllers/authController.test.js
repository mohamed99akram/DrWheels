const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const { createTestUser, generateToken, getAuthHeaders } = require('../helpers/testHelpers');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!@#',
        name: 'New User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email.toLowerCase());
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with existing email', async () => {
      const user = await createTestUser();
      const userData = {
        email: user.email,
        password: 'SecurePass123!@#',
        name: 'Another User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User already exists');
    });

    it('should reject weak password', async () => {
      const userData = {
        email: 'weak@example.com',
        password: 'weak',
        name: 'Weak User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should reject invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!@#',
        name: 'Invalid User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const password = 'SecurePass123!@#';
      const user = await createTestUser({ password });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!@#'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!@#'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const response = await request(app)
        .get('/api/auth/me')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body.email).toBe(user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('No token, authorization denied');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set(getAuthHeaders('invalid-token'))
        .expect(401);

      expect(response.body.error).toBe('Token is not valid');
    });

    it('should reject request with expired token', async () => {
      const jwt = require('jsonwebtoken');
      const user = await createTestUser();
      const expiredToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set(getAuthHeaders(expiredToken))
        .expect(401);
    });
  });
});

