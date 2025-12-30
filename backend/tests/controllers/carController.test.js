const request = require('supertest');
const app = require('../../server');
const Car = require('../../models/Car');
const { createTestUser, createTestCar, generateToken, getAuthHeaders } = require('../helpers/testHelpers');

describe('Car Controller', () => {
  let user, token;

  beforeEach(async () => {
    user = await createTestUser();
    token = generateToken(user._id);
  });

  describe('GET /api/cars', () => {
    it('should get all available cars', async () => {
      await createTestCar(user._id);
      await createTestCar(user._id, { make: 'Honda', model: 'Civic' });

      const response = await request(app)
        .get('/api/cars')
        .expect(200);

      expect(response.body).toHaveProperty('cars');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.cars.length).toBe(2);
    });

    it('should filter cars by make', async () => {
      await createTestCar(user._id, { make: 'Toyota' });
      await createTestCar(user._id, { make: 'Honda' });

      const response = await request(app)
        .get('/api/cars?make=Toyota')
        .expect(200);

      expect(response.body.cars.length).toBe(1);
      expect(response.body.cars[0].make).toBe('Toyota');
    });

    it('should filter cars by price range', async () => {
      await createTestCar(user._id, { price: 10000 });
      await createTestCar(user._id, { price: 50000 });
      await createTestCar(user._id, { price: 30000 });

      const response = await request(app)
        .get('/api/cars?minPrice=20000&maxPrice=40000')
        .expect(200);

      expect(response.body.cars.length).toBe(1);
      expect(response.body.cars[0].price).toBe(30000);
    });

    it('should paginate results', async () => {
      // Create multiple cars
      for (let i = 0; i < 5; i++) {
        await createTestCar(user._id, { make: `Brand${i}` });
      }

      const response = await request(app)
        .get('/api/cars?page=1&limit=2')
        .expect(200);

      expect(response.body.cars.length).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should not return sold cars', async () => {
      await createTestCar(user._id, { status: 'available' });
      await createTestCar(user._id, { status: 'sold' });

      const response = await request(app)
        .get('/api/cars')
        .expect(200);

      expect(response.body.cars.length).toBe(1);
      expect(response.body.cars[0].status).toBe('available');
    });
  });

  describe('GET /api/cars/:id', () => {
    it('should get car by id', async () => {
      const car = await createTestCar(user._id);

      const response = await request(app)
        .get(`/api/cars/${car._id}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(car._id.toString());
      expect(response.body.make).toBe(car.make);
    });

    it('should return 404 for non-existent car', async () => {
      const fakeId = require('mongoose').Types.ObjectId();
      const response = await request(app)
        .get(`/api/cars/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Car not found');
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app)
        .get('/api/cars/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/cars', () => {
    it('should create a new car', async () => {
      const carData = {
        make: 'Ford',
        model: 'Mustang',
        year: 2021,
        price: 35000,
        mileage: 5000,
        color: 'Red',
        description: 'Fast car'
      };

      const response = await request(app)
        .post('/api/cars')
        .set(getAuthHeaders(token))
        .send(carData)
        .expect(201);

      expect(response.body.make).toBe(carData.make);
      expect(response.body.seller.toString()).toBe(user._id.toString());
    });

    it('should reject car creation without authentication', async () => {
      const response = await request(app)
        .post('/api/cars')
        .send({ make: 'Ford', model: 'Mustang', year: 2021, price: 35000 })
        .expect(401);
    });

    it('should reject invalid car data', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set(getAuthHeaders(token))
        .send({ make: '', price: -100 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/cars/:id', () => {
    it('should update own car', async () => {
      const car = await createTestCar(user._id);

      const response = await request(app)
        .put(`/api/cars/${car._id}`)
        .set(getAuthHeaders(token))
        .send({ price: 30000 })
        .expect(200);

      expect(response.body.price).toBe(30000);
    });

    it('should not allow updating other user\'s car', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const car = await createTestCar(otherUser._id);

      const response = await request(app)
        .put(`/api/cars/${car._id}`)
        .set(getAuthHeaders(token))
        .send({ price: 30000 })
        .expect(403);

      expect(response.body.error).toBe('Not authorized');
    });

    it('should allow admin to update any car', async () => {
      const admin = await createTestUser({ email: 'admin@example.com', role: 'admin' });
      const adminToken = generateToken(admin._id);
      const car = await createTestCar(user._id);

      const response = await request(app)
        .put(`/api/cars/${car._id}`)
        .set(getAuthHeaders(adminToken))
        .send({ price: 30000 })
        .expect(200);
    });
  });

  describe('DELETE /api/cars/:id', () => {
    it('should delete own car', async () => {
      const car = await createTestCar(user._id);

      const response = await request(app)
        .delete(`/api/cars/${car._id}`)
        .set(getAuthHeaders(token))
        .expect(200);

      const deletedCar = await Car.findById(car._id);
      expect(deletedCar).toBeNull();
    });

    it('should not allow deleting other user\'s car', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const car = await createTestCar(otherUser._id);

      const response = await request(app)
        .delete(`/api/cars/${car._id}`)
        .set(getAuthHeaders(token))
        .expect(403);
    });
  });

  describe('GET /api/cars/my-cars', () => {
    it('should get user\'s own cars', async () => {
      await createTestCar(user._id);
      await createTestCar(user._id, { make: 'Honda' });

      const response = await request(app)
        .get('/api/cars/my-cars')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body.length).toBe(2);
      response.body.forEach(car => {
        expect(car.seller._id.toString()).toBe(user._id.toString());
      });
    });
  });
});

