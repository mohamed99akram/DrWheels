const request = require('supertest');
const app = require('../../server');
const { createTestUser, generateToken, getAuthHeaders } = require('../helpers/testHelpers');

describe('Validation Middleware', () => {
  describe('Auth Validation', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!@#',
          name: 'Test User'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      // Should have password validation error
      const passwordError = response.body.details.find(d => 
        d.param === 'password' || d.path === 'password'
      );
      expect(passwordError).toBeDefined();
    });

    it('should reject invalid name format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!@#',
          name: 'Test123' // Contains numbers
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should accept valid registration data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid@example.com',
          password: 'SecurePass123!@#',
          name: 'Valid User'
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('valid@example.com');
    });
  });

  describe('Car Validation', () => {
    let user, token;

    beforeEach(async () => {
      user = await createTestUser();
      token = generateToken(user._id);
    });

    it('should reject invalid car data', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set(getAuthHeaders(token))
        .send({
          make: '', // Empty make
          model: 'Test',
          year: 2020,
          price: -1000 // Negative price
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should reject invalid car ID format', async () => {
      const response = await request(app)
        .get('/api/cars/invalid-id-format')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid car data', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set(getAuthHeaders(token))
        .send({
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          price: 25000,
          mileage: 10000,
          color: 'Blue',
          description: 'A reliable car'
        })
        .expect(201);

      expect(response.body.make).toBe('Toyota');
    });
  });

  describe('Order Validation', () => {
    let buyer, seller, buyerToken, sellerToken, car;

    beforeEach(async () => {
      buyer = await createTestUser({ email: 'buyer@example.com' });
      seller = await createTestUser({ email: 'seller@example.com' });
      buyerToken = generateToken(buyer._id);
      sellerToken = generateToken(seller._id);
      const { createTestCar } = require('../helpers/testHelpers');
      car = await createTestCar(seller._id);
    });

    it('should reject invalid order data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeaders(buyerToken))
        .send({
          carId: 'invalid-id'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid order data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeaders(buyerToken))
        .send({
          carId: car._id,
          notes: 'Please contact me'
        })
        .expect(201);

      expect(response.body.car._id.toString()).toBe(car._id.toString());
    });
  });

  describe('Review Validation', () => {
    let user, seller, token, sellerToken, car;

    beforeEach(async () => {
      user = await createTestUser({ email: 'user@example.com' });
      seller = await createTestUser({ email: 'seller@example.com' });
      token = generateToken(user._id);
      sellerToken = generateToken(seller._id);
      const { createTestCar } = require('../helpers/testHelpers');
      car = await createTestCar(seller._id);
    });

    it('should reject invalid rating', async () => {
      const response = await request(app)
        .post(`/api/reviews/car/${car._id}`)
        .set(getAuthHeaders(token))
        .send({
          rating: 6, // Invalid: should be 1-5
          comment: 'Test review'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject empty comment', async () => {
      const response = await request(app)
        .post(`/api/reviews/car/${car._id}`)
        .set(getAuthHeaders(token))
        .send({
          rating: 5,
          comment: '' // Empty comment
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid review data', async () => {
      const response = await request(app)
        .post(`/api/reviews/car/${car._id}`)
        .set(getAuthHeaders(token))
        .send({
          rating: 5,
          comment: 'Great car!'
        })
        .expect(201);

      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe('Great car!');
    });
  });
});

