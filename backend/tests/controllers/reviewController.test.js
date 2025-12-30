const request = require('supertest');
const app = require('../../server');
const Review = require('../../models/Review');
const Car = require('../../models/Car');
const {
  createTestUser,
  createTestCar,
  createTestReview,
  generateToken,
  getAuthHeaders
} = require('../helpers/testHelpers');

describe('Review Controller', () => {
  let user, seller, car, token, sellerToken;

  beforeEach(async () => {
    user = await createTestUser({ email: 'user@example.com' });
    seller = await createTestUser({ email: 'seller@example.com' });
    token = generateToken(user._id);
    sellerToken = generateToken(seller._id);
    car = await createTestCar(seller._id);
  });

  describe('POST /api/reviews/car/:carId', () => {
    it('should create a new review', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Excellent car!'
      };

      const response = await request(app)
        .post(`/api/reviews/car/${car._id}`)
        .set(getAuthHeaders(token))
        .send(reviewData)
        .expect(201);

      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe(reviewData.comment);
      expect(response.body.user._id.toString()).toBe(user._id.toString());

      // Check car rating updated
      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.averageRating).toBe(5);
      expect(updatedCar.reviewCount).toBe(1);
    });

    it('should not allow duplicate reviews', async () => {
      await createTestReview(user._id, car._id);

      const response = await request(app)
        .post(`/api/reviews/car/${car._id}`)
        .set(getAuthHeaders(token))
        .send({ rating: 4, comment: 'Another review' })
        .expect(400);

      expect(response.body.error).toBe('You have already reviewed this car');
    });

    it('should reject invalid rating', async () => {
      const response = await request(app)
        .post(`/api/reviews/car/${car._id}`)
        .set(getAuthHeaders(token))
        .send({ rating: 6, comment: 'Invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      // Validation errors may include details
      if (response.body.details) {
        expect(Array.isArray(response.body.details)).toBe(true);
      }
    });

    it('should return 404 for non-existent car', async () => {
      const mongoose = require('mongoose');
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/reviews/car/${fakeId}`)
        .set(getAuthHeaders(token))
        .send({ rating: 5 })
        .expect(404);
    });
  });

  describe('PUT /api/reviews/:reviewId', () => {
    it('should update own review', async () => {
      const review = await createTestReview(user._id, car._id, { rating: 3 });

      const response = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set(getAuthHeaders(token))
        .send({ rating: 5, comment: 'Updated review' })
        .expect(200);

      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe('Updated review');

      // Check car rating updated
      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.averageRating).toBe(5);
    });

    it('should not allow updating other user\'s review', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const review = await createTestReview(otherUser._id, car._id);

      const response = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set(getAuthHeaders(token))
        .send({ rating: 5 })
        .expect(403);
    });
  });

  describe('DELETE /api/reviews/:reviewId', () => {
    it('should delete own review', async () => {
      const review = await createTestReview(user._id, car._id);

      const response = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set(getAuthHeaders(token))
        .expect(200);

      const deletedReview = await Review.findById(review._id);
      expect(deletedReview).toBeNull();

      // Check car rating updated
      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.reviewCount).toBe(0);
      expect(updatedCar.averageRating).toBe(0);
    });

    it('should allow admin to delete any review', async () => {
      const admin = await createTestUser({ email: 'admin@example.com', role: 'admin' });
      const adminToken = generateToken(admin._id);
      const review = await createTestReview(user._id, car._id);

      const response = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set(getAuthHeaders(adminToken))
        .expect(200);
    });
  });

  describe('GET /api/reviews/car/:carId', () => {
    it('should get all reviews for a car', async () => {
      await createTestReview(user._id, car._id, { rating: 5 });
      const otherUser = await createTestUser({ email: 'other@example.com' });
      await createTestReview(otherUser._id, car._id, { rating: 4 });

      const response = await request(app)
        .get(`/api/reviews/car/${car._id}`)
        .expect(200);

      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/reviews/user', () => {
    it('should get user\'s own reviews', async () => {
      await createTestReview(user._id, car._id);
      const otherCar = await createTestCar(seller._id, { make: 'Honda' });
      await createTestReview(user._id, otherCar._id);

      const response = await request(app)
        .get('/api/reviews/user')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body.length).toBe(2);
      response.body.forEach(review => {
        // getUserReviews populates car, not user, so user is just an ID
        const userId = typeof review.user === 'object' && review.user._id
          ? review.user._id.toString()
          : review.user.toString();
        expect(userId).toBe(user._id.toString());
      });
    });
  });
});

