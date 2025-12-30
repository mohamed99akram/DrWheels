const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!@#',
        name: 'Test User'
      };

      const user = await User.create(userData);

      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.name).toBe(userData.name);
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
      expect(user.role).toBe('user');
    });

    it('should hash password before saving', async () => {
      const user = new User({
        email: 'test2@example.com',
        password: 'SecurePass123!@#',
        name: 'Test User 2'
      });

      await user.save();

      const isHashed = await bcrypt.compare('SecurePass123!@#', user.password);
      expect(isHashed).toBe(true);
    });

    it('should not hash password if not modified', async () => {
      const user = await User.create({
        email: 'test3@example.com',
        password: 'SecurePass123!@#',
        name: 'Test User 3'
      });

      const originalPassword = user.password;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });

    it('should require email', async () => {
      const user = new User({
        password: 'SecurePass123!@#',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require password', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require minimum password length', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'short',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      await User.create({
        email: 'unique@example.com',
        password: 'SecurePass123!@#',
        name: 'User 1'
      });

      const duplicateUser = new User({
        email: 'unique@example.com',
        password: 'SecurePass123!@#',
        name: 'User 2'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should lowercase email', async () => {
      const user = await User.create({
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePass123!@#',
        name: 'Test User'
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should trim name and email', async () => {
      const user = await User.create({
        email: '  test@example.com  ',
        password: 'SecurePass123!@#',
        name: '  Test User  '
      });

      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const password = 'SecurePass123!@#';
      const user = await User.create({
        email: 'test@example.com',
        password: password,
        name: 'Test User'
      });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'SecurePass123!@#',
        name: 'Test User'
      });

      const isMatch = await user.comparePassword('WrongPassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('should default to user role', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'SecurePass123!@#',
        name: 'Test User'
      });

      expect(user.role).toBe('user');
    });

    it('should accept admin role', async () => {
      const user = await User.create({
        email: 'admin@example.com',
        password: 'SecurePass123!@#',
        name: 'Admin User',
        role: 'admin'
      });

      expect(user.role).toBe('admin');
    });

    it('should reject invalid role', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!@#',
        name: 'Test User',
        role: 'invalid'
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'SecurePass123!@#',
        name: 'Test User'
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });
});

