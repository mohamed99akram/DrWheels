const Car = require('../../models/Car');
const User = require('../../models/User');
const { createTestUser } = require('../helpers/testHelpers');

describe('Car Model', () => {
  let seller;

  beforeEach(async () => {
    seller = await createTestUser();
  });

  describe('Car Creation', () => {
    it('should create a car with all required fields', async () => {
      const carData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        seller: seller._id
      };

      const car = await Car.create(carData);

      expect(car.make).toBe(carData.make);
      expect(car.model).toBe(carData.model);
      expect(car.year).toBe(carData.year);
      expect(car.price).toBe(carData.price);
      expect(car.seller.toString()).toBe(seller._id.toString());
      expect(car.status).toBe('available');
      expect(car.averageRating).toBe(0);
      expect(car.reviewCount).toBe(0);
    });

    it('should require make', async () => {
      const car = new Car({
        model: 'Camry',
        year: 2020,
        price: 25000,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should require model', async () => {
      const car = new Car({
        make: 'Toyota',
        year: 2020,
        price: 25000,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should require year', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        price: 25000,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should require price', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should require seller', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should reject invalid year (too old)', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: 1800,
        price: 25000,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should reject invalid year (future)', async () => {
      const futureYear = new Date().getFullYear() + 2;
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: futureYear,
        price: 25000,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should reject negative price', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: -1000,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should reject negative mileage', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        mileage: -100,
        seller: seller._id
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should default mileage to 0', async () => {
      const car = await Car.create({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        seller: seller._id
      });

      expect(car.mileage).toBe(0);
    });

    it('should accept valid status values', async () => {
      const statuses = ['available', 'sold', 'pending'];
      
      for (const status of statuses) {
        const car = await Car.create({
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          price: 25000,
          seller: seller._id,
          status
        });

        expect(car.status).toBe(status);
      }
    });

    it('should reject invalid status', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        seller: seller._id,
        status: 'invalid'
      });

      await expect(car.save()).rejects.toThrow();
    });

    it('should trim make and model', async () => {
      const car = await Car.create({
        make: '  Toyota  ',
        model: '  Camry  ',
        year: 2020,
        price: 25000,
        seller: seller._id
      });

      expect(car.make).toBe('Toyota');
      expect(car.model).toBe('Camry');
    });

    it('should accept images array', async () => {
      const car = await Car.create({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        seller: seller._id,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      });

      expect(car.images.length).toBe(2);
    });

    it('should limit averageRating to 0-5', async () => {
      const car = new Car({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        seller: seller._id,
        averageRating: 6
      });

      await expect(car.save()).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', async () => {
      const car = await Car.create({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        seller: seller._id
      });

      expect(car.createdAt).toBeDefined();
      expect(car.updatedAt).toBeDefined();
    });
  });
});

