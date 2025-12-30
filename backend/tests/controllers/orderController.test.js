const request = require('supertest');
const app = require('../../server');
const Order = require('../../models/Order');
const Car = require('../../models/Car');
const {
  createTestUser,
  createTestCar,
  createTestOrder,
  generateToken,
  getAuthHeaders
} = require('../helpers/testHelpers');

describe('Order Controller', () => {
  let buyer, seller, buyerToken, sellerToken, car;

  beforeEach(async () => {
    buyer = await createTestUser({ email: 'buyer@example.com' });
    seller = await createTestUser({ email: 'seller@example.com' });
    buyerToken = generateToken(buyer._id);
    sellerToken = generateToken(seller._id);
    car = await createTestCar(seller._id);
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeaders(buyerToken))
        .send({ carId: car._id, notes: 'Please contact me' })
        .expect(201);

      expect(response.body.buyer._id.toString()).toBe(buyer._id.toString());
      expect(response.body.car._id.toString()).toBe(car._id.toString());
      expect(response.body.status).toBe('pending');

      // Check car status changed to pending
      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.status).toBe('pending');
    });

    it('should not allow buying own car', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeaders(sellerToken))
        .send({ carId: car._id })
        .expect(400);

      expect(response.body.error).toBe('You cannot purchase your own car');
    });

    it('should not allow ordering unavailable car', async () => {
      const soldCar = await createTestCar(seller._id, { status: 'sold' });

      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeaders(buyerToken))
        .send({ carId: soldCar._id })
        .expect(400);

      expect(response.body.error).toBe('Car is not available for purchase');
    });

    it('should return 404 for non-existent car', async () => {
      const mongoose = require('mongoose');
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeaders(buyerToken))
        .send({ carId: fakeId })
        .expect(404);
    });
  });

  describe('GET /api/orders', () => {
    it('should get buyer orders', async () => {
      await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .get('/api/orders?type=buyer')
        .set(getAuthHeaders(buyerToken))
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].buyer._id.toString()).toBe(buyer._id.toString());
    });

    it('should get seller orders', async () => {
      await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .get('/api/orders?type=seller')
        .set(getAuthHeaders(sellerToken))
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].seller._id.toString()).toBe(seller._id.toString());
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by id for buyer', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeaders(buyerToken))
        .expect(200);

      expect(response.body._id.toString()).toBe(order._id.toString());
    });

    it('should get order by id for seller', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeaders(sellerToken))
        .expect(200);
    });

    it('should not allow unauthorized access', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherToken = generateToken(otherUser._id);
      const order = await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeaders(otherToken))
        .expect(403);
    });
  });

  describe('PUT /api/orders/:orderId/status', () => {
    it('should update order status by seller', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set(getAuthHeaders(sellerToken))
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should mark car as sold when order completed', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);

      await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set(getAuthHeaders(sellerToken))
        .send({ status: 'completed' })
        .expect(200);

      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.status).toBe('sold');
    });

    it('should mark car as available when order cancelled', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);
      // First mark car as pending
      await Car.findByIdAndUpdate(car._id, { status: 'pending' });

      await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set(getAuthHeaders(sellerToken))
        .send({ status: 'cancelled' })
        .expect(200);

      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.status).toBe('available');
    });

    it('should not allow buyer to update order status', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set(getAuthHeaders(buyerToken))
        .send({ status: 'confirmed' })
        .expect(403);
    });
  });

  describe('POST /api/orders/:orderId/cancel', () => {
    it('should cancel order by buyer', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);
      await Car.findByIdAndUpdate(car._id, { status: 'pending' });

      const response = await request(app)
        .post(`/api/orders/${order._id}/cancel`)
        .set(getAuthHeaders(buyerToken))
        .expect(200);

      const updatedOrder = await Order.findById(order._id);
      expect(updatedOrder.status).toBe('cancelled');

      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.status).toBe('available');
    });

    it('should not allow seller to cancel order', async () => {
      const order = await createTestOrder(buyer._id, seller._id, car._id);

      const response = await request(app)
        .post(`/api/orders/${order._id}/cancel`)
        .set(getAuthHeaders(sellerToken))
        .expect(403);
    });
  });
});

