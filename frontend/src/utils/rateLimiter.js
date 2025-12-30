/**
 * Client-side rate limiting
 * Prevents abuse and implements OWASP rate limiting recommendations
 */

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.defaultLimit = {
      windowMs: 60000, // 1 minute
      max: 10 // 10 requests per minute
    };
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key, limit = this.defaultLimit) {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now - record.windowStart > limit.windowMs) {
      // New window
      this.requests.set(key, {
        count: 1,
        windowStart: now
      });
      return { allowed: true, remaining: limit.max - 1 };
    }

    if (record.count >= limit.max) {
      // Rate limit exceeded
      const resetTime = record.windowStart + limit.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime
      };
    }

    // Increment count
    record.count++;
    return {
      allowed: true,
      remaining: limit.max - record.count
    };
  }

  /**
   * Clear rate limit for a key
   */
  clear(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll() {
    this.requests.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations
 */
export const rateLimits = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 attempts per 15 minutes
  },
  
  // API calls
  api: {
    windowMs: 60000, // 1 minute
    max: 30 // 30 requests per minute
  },
  
  // Form submissions
  form: {
    windowMs: 60000, // 1 minute
    max: 10 // 10 submissions per minute
  },
  
  // Search requests
  search: {
    windowMs: 10000, // 10 seconds
    max: 5 // 5 searches per 10 seconds
  }
};

/**
 * Check rate limit before making request
 */
export const checkRateLimit = (action, limitConfig) => {
  const key = `rate_limit_${action}`;
  const limit = limitConfig || rateLimits.api;
  return rateLimiter.isAllowed(key, limit);
};

