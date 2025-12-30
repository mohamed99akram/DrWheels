import { checkRateLimit, rateLimits, rateLimiter } from '../rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limiter state
    rateLimiter.clearAll();
  });

  describe('checkRateLimit', () => {
    it('should allow request within limit', () => {
      const result = checkRateLimit('test-action', rateLimits.api);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should track requests correctly', () => {
      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('test-action', { windowMs: 60000, max: 10 });
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const limit = { windowMs: 60000, max: 2 };
      
      // Make requests up to limit
      checkRateLimit('test-action', limit);
      checkRateLimit('test-action', limit);
      
      // This should be blocked
      const result = checkRateLimit('test-action', limit);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after time window', (done) => {
      const limit = { windowMs: 100, max: 1 }; // 100ms window, max 1 request
      
      // First request should be allowed
      const result1 = checkRateLimit('test-action', limit);
      expect(result1.allowed).toBe(true);
      
      // Second request should be blocked
      const result2 = checkRateLimit('test-action', limit);
      expect(result2.allowed).toBe(false);
      
      // After window expires, should be allowed again
      setTimeout(() => {
        const result3 = checkRateLimit('test-action', limit);
        expect(result3.allowed).toBe(true);
        done();
      }, 150);
    }, 200);
  });

  describe('rateLimits configuration', () => {
    it('should have auth rate limit configured', () => {
      expect(rateLimits.auth).toBeDefined();
      expect(rateLimits.auth.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(rateLimits.auth.max).toBe(5);
    });

    it('should have api rate limit configured', () => {
      expect(rateLimits.api).toBeDefined();
      expect(rateLimits.api.windowMs).toBe(60000); // 1 minute
      expect(rateLimits.api.max).toBe(30);
    });

    it('should have form rate limit configured', () => {
      expect(rateLimits.form).toBeDefined();
      expect(rateLimits.form.windowMs).toBe(60000); // 1 minute
      expect(rateLimits.form.max).toBe(10);
    });

    it('should have search rate limit configured', () => {
      expect(rateLimits.search).toBeDefined();
      expect(rateLimits.search.windowMs).toBe(10000); // 10 seconds
      expect(rateLimits.search.max).toBe(5);
    });
  });

  describe('rateLimiter instance', () => {
    it('should clear specific action', () => {
      const limit = { windowMs: 60000, max: 1 };
      
      checkRateLimit('action1', limit);
      checkRateLimit('action2', limit);
      
      rateLimiter.clear('rate_limit_action1');
      
      // action1 should be allowed again
      const result = checkRateLimit('action1', limit);
      expect(result.allowed).toBe(true);
      
      // action2 should still be blocked
      const result2 = checkRateLimit('action2', limit);
      expect(result2.allowed).toBe(false);
    });

    it('should clear all actions', () => {
      const limit = { windowMs: 60000, max: 1 };
      
      checkRateLimit('action1', limit);
      checkRateLimit('action2', limit);
      
      rateLimiter.clearAll();
      
      // Both should be allowed again
      expect(checkRateLimit('action1', limit).allowed).toBe(true);
      expect(checkRateLimit('action2', limit).allowed).toBe(true);
    });

    it('should use default limit when none provided', () => {
      const result = checkRateLimit('test-action');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });
  });
});

