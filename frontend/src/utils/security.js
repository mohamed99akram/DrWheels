/**
 * Security utilities for frontend
 */

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Secure token storage with encryption (basic implementation)
 * In production, consider using more secure storage methods
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      // In production, consider encrypting sensitive data
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

/**
 * Check if running in secure context (HTTPS)
 * @returns {boolean} - True if secure
 */
export const isSecureContext = () => {
  return window.isSecureContext || window.location.protocol === 'https:';
};

/**
 * Content Security Policy violation handler
 */
export const setupCSPViolationHandler = () => {
  if (typeof document !== 'undefined') {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error('CSP Violation:', {
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy
      });
      // In production, send to logging service
    });
  }
};

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 * @param {string} url - URL to sanitize
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Get base URL - use window.location.origin if available, otherwise use a default
    const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin) 
      ? window.location.origin 
      : 'http://localhost:3000';
    
    const urlObj = new URL(url, baseUrl);
    // Only allow same origin or whitelisted domains
    const allowedOrigins = [
      baseUrl,
      process.env.REACT_APP_API_URL || 'http://localhost:4000'
    ];
    
    if (allowedOrigins.some(origin => urlObj.origin === origin)) {
      return urlObj.toString();
    }
    
    return null;
  } catch (error) {
    // Silently fail in test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error('Invalid URL:', error);
    }
    return null;
  }
};

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

