const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Car = require('../../models/Car');
const Order = require('../../models/Order');
const Review = require('../../models/Review');

// Create a test user
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'Test1234!@#$',
    name: 'Test User',
    role: 'user',
    ...overrides
  };
  return await User.create(defaultUser);
};

// Create a test admin user
const createTestAdmin = async (overrides = {}) => {
  return await createTestUser({
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    ...overrides
  });
};

// Generate JWT token for a user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens', {
    expiresIn: '7d'
  });
};

// Create authenticated request headers
const getAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Create a test car
const createTestCar = async (sellerId, overrides = {}) => {
  const defaultCar = {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 25000,
    mileage: 10000,
    color: 'Blue',
    description: 'A reliable sedan',
    seller: sellerId,
    status: 'available',
    ...overrides
  };
  return await Car.create(defaultCar);
};

// Create a test order
const createTestOrder = async (buyerId, sellerId, carId, overrides = {}) => {
  const defaultOrder = {
    buyer: buyerId,
    seller: sellerId,
    car: carId,
    amount: 25000,
    status: 'pending',
    paymentStatus: 'pending',
    ...overrides
  };
  return await Order.create(defaultOrder);
};

// Create a test review
const createTestReview = async (userId, carId, overrides = {}) => {
  const defaultReview = {
    user: userId,
    car: carId,
    rating: 5,
    comment: 'Great car!',
    ...overrides
  };
  return await Review.create(defaultReview);
};

module.exports = {
  createTestUser,
  createTestAdmin,
  generateToken,
  getAuthHeaders,
  createTestCar,
  createTestOrder,
  createTestReview
};

