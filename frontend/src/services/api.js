import axios from 'axios';
import { secureStorage } from '../utils/security';
import { addCSRFTokenToHeaders } from '../utils/csrfProtection';
import { checkRateLimit, rateLimits } from '../utils/rateLimiter';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and CSRF protection
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = secureStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers = addCSRFTokenToHeaders(config.headers);
    }

    // Rate limiting check
    const rateLimitKey = config.url?.includes('/auth/') ? 'auth' : 
                        config.url?.includes('/search') ? 'search' : 'api';
    
    const rateLimit = checkRateLimit(rateLimitKey, rateLimits[rateLimitKey]);
    if (!rateLimit.allowed) {
      return Promise.reject(new Error(`Rate limit exceeded. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`));
    }

    // Sanitize request data
    if (config.data && typeof config.data === 'object') {
      config.data = sanitizeRequestData(config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Sanitize request data to prevent injection attacks
 */
const sanitizeRequestData = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove potential XSS and SQL injection patterns
        sanitized[key] = value
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/['";\\]/g, '');
      } else {
        sanitized[key] = sanitizeRequestData(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      secureStorage.removeItem('token');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
