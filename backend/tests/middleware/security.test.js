const request = require('supertest');
const app = require('../../server');

describe('Security Headers', () => {
  describe('HTTP Security Headers', () => {
    it('should include HSTS header in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/health')
        .expect(200);

      // HSTS should be present in production
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(response.headers['strict-transport-security']).toContain('includeSubDomains');

      process.env.NODE_ENV = originalEnv;
    });

    it('should include X-Frame-Options header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should include X-Content-Type-Options header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include Referrer-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should include Permissions-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['permissions-policy']).toBeDefined();
      expect(response.headers['permissions-policy']).toContain('geolocation=()');
    });

    it('should include X-DNS-Prefetch-Control header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('should include Cross-Origin-Opener-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
    });

    it('should include Cross-Origin-Resource-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['cross-origin-resource-policy']).toBe('cross-origin');
    });

    it('should not expose X-Powered-By header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should include Content-Security-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });

  describe('Cache Control for Sensitive Endpoints', () => {
    it('should set no-cache headers for auth endpoints', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'test' })
        .expect(401); // Will fail but headers should be set

      expect(response.headers['cache-control']).toContain('no-store');
      expect(response.headers['cache-control']).toContain('no-cache');
      expect(response.headers['pragma']).toBe('no-cache');
    });
  });

  describe('Rate Limiting Headers', () => {
    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/cars')
        .expect(200);

      // Rate limit headers may be present
      expect(response.headers['x-ratelimit-limit'] || response.headers['ratelimit-limit']).toBeDefined();
    });
  });
});

