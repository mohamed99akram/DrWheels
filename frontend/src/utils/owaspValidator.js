/**
 * OWASP-based input validation and sanitization
 * Implements OWASP Top 10 security best practices
 */

import validator from 'validator';
import DOMPurify from 'dompurify';
import xss from 'xss';

/**
 * OWASP Input Validation Rules
 */
export const owaspRules = {
  // Email validation (OWASP compliant)
  email: (value) => {
    if (!value || typeof value !== 'string') return false;
    return validator.isEmail(value) && 
           validator.isLength(value, { min: 5, max: 254 }) &&
           !/[<>"'']/.test(value); // Prevent XSS in email
  },

  // Password validation (OWASP ASVS Level 2)
  password: (value) => {
    if (!value || typeof value !== 'string') return false;
    // Minimum 8 chars, uppercase, lowercase, number, special char
    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[@$!%*?&]/.test(value);
    const noCommonPatterns = !/password|123456|qwerty/i.test(value);
    
    return hasMinLength && hasUpperCase && hasLowerCase && 
           hasNumber && hasSpecialChar && noCommonPatterns;
  },

  // Name validation
  name: (value) => {
    if (!value || typeof value !== 'string') return false;
    // Only letters, spaces, hyphens, apostrophes
    return validator.isLength(value, { min: 2, max: 50 }) &&
           /^[a-zA-Z\s\-']+$/.test(value) &&
           !/[<>"'&]/.test(value); // Prevent XSS
  },

  // URL validation
  url: (value) => {
    if (!value || typeof value !== 'string') return false;
    return validator.isURL(value, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    });
  },

  // Numeric validation
  number: (value, options = {}) => {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    if (isNaN(num)) return false;
    if (options.min !== undefined && num < options.min) return false;
    if (options.max !== undefined && num > options.max) return false;
    return true;
  },

  // Year validation
  year: (value) => {
    const currentYear = new Date().getFullYear();
    return owaspRules.number(value, { min: 1900, max: currentYear + 1 });
  },

  // Price validation
  price: (value) => {
    return owaspRules.number(value, { min: 0, max: 10000000 });
  },

  // Mileage validation
  mileage: (value) => {
    return owaspRules.number(value, { min: 0, max: 1000000 });
  },

  // Text field validation (prevent injection)
  text: (value, maxLength = 1000) => {
    if (!value || typeof value !== 'string') return false;
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(--|#|\/\*|\*\/|;)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\bUNION\b.*\bSELECT\b)/i
    ];
    
    if (sqlPatterns.some(pattern => pattern.test(value))) {
      return false;
    }
    
    // Check for XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    if (xssPatterns.some(pattern => pattern.test(value))) {
      return false;
    }
    
    return validator.isLength(value, { min: 0, max: maxLength });
  },

  // Description validation
  description: (value) => {
    return owaspRules.text(value, 2000);
  },

  // Comment validation
  comment: (value) => {
    return owaspRules.text(value, 1000);
  }
};

/**
 * Sanitize input using OWASP recommendations
 */
export const sanitizeInput = {
  // HTML sanitization (XSS prevention)
  html: (value) => {
    if (!value || typeof value !== 'string') return value;
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  },

  // Text sanitization
  text: (value) => {
    if (!value || typeof value !== 'string') return value;
    // Remove HTML tags
    let sanitized = value.replace(/<[^>]*>/g, '');
    // Escape special characters
    sanitized = xss(sanitized);
    // Remove control characters
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    return sanitized.trim();
  },

  // URL sanitization
  url: (value) => {
    if (!value || typeof value !== 'string') return value;
    // Remove javascript: and data: protocols
    const sanitized = value.replace(/^(javascript|data|vbscript):/i, '');
    // Validate and sanitize
    if (validator.isURL(sanitized, { require_protocol: true })) {
      return sanitized;
    }
    return '';
  },

  // Email sanitization
  email: (value) => {
    if (!value || typeof value !== 'string') return value;
    return validator.normalizeEmail(value) || value;
  },

  // Number sanitization
  number: (value) => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
};

/**
 * Validate and sanitize form data
 */
export const validateAndSanitize = (data, schema) => {
  const errors = {};
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required
    if (rules.required && (!value || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip validation if optional and empty
    if (!rules.required && (!value || value === '')) {
      sanitized[field] = rules.default || null;
      continue;
    }

    // Validate
    if (rules.validate && !rules.validate(value, rules.options)) {
      errors[field] = rules.message || `${field} is invalid`;
      continue;
    }

    // Sanitize
    if (rules.sanitize) {
      sanitized[field] = rules.sanitize(value);
    } else {
      sanitized[field] = value;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

/**
 * OWASP validation schemas for common forms
 */
export const validationSchemas = {
  login: {
    email: {
      required: true,
      validate: owaspRules.email,
      sanitize: sanitizeInput.email,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      validate: (value) => value && value.length > 0,
      message: 'Password is required'
    }
  },

  register: {
    name: {
      required: true,
      validate: owaspRules.name,
      sanitize: sanitizeInput.text,
      message: 'Name must be 2-50 characters and contain only letters'
    },
    email: {
      required: true,
      validate: owaspRules.email,
      sanitize: sanitizeInput.email,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      validate: owaspRules.password,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    }
  },

  car: {
    make: {
      required: true,
      validate: (value) => owaspRules.text(value, 50),
      sanitize: sanitizeInput.text,
      message: 'Make must be 1-50 characters'
    },
    model: {
      required: true,
      validate: (value) => owaspRules.text(value, 50),
      sanitize: sanitizeInput.text,
      message: 'Model must be 1-50 characters'
    },
    year: {
      required: true,
      validate: owaspRules.year,
      sanitize: sanitizeInput.number,
      message: 'Year must be between 1900 and current year + 1'
    },
    price: {
      required: true,
      validate: owaspRules.price,
      sanitize: sanitizeInput.number,
      message: 'Price must be a positive number'
    },
    mileage: {
      required: false,
      validate: (value) => !value || owaspRules.mileage(value),
      sanitize: sanitizeInput.number,
      default: 0
    },
    color: {
      required: false,
      validate: (value) => !value || owaspRules.text(value, 30),
      sanitize: sanitizeInput.text,
      default: ''
    },
    description: {
      required: false,
      validate: (value) => !value || owaspRules.description(value),
      sanitize: sanitizeInput.text,
      default: ''
    },
    images: {
      required: false,
      validate: (value) => {
        if (!value || !Array.isArray(value)) return true;
        return value.every(url => !url || owaspRules.url(url));
      },
      sanitize: (value) => {
        if (!value || !Array.isArray(value)) return [];
        return value.map(url => sanitizeInput.url(url)).filter(Boolean);
      },
      default: []
    }
  },

  review: {
    rating: {
      required: true,
      validate: (value) => owaspRules.number(value, { min: 1, max: 5 }),
      sanitize: sanitizeInput.number,
      message: 'Rating must be between 1 and 5'
    },
    comment: {
      required: false,
      validate: (value) => !value || owaspRules.comment(value),
      sanitize: sanitizeInput.text,
      default: ''
    }
  }
};

/**
 * Real-time validation feedback
 */
export const getValidationError = (field, value, schema) => {
  const rules = schema[field];
  if (!rules) return null;

  if (rules.required && (!value || value === '')) {
    return rules.message || `${field} is required`;
  }

  if (value && rules.validate && !rules.validate(value, rules.options)) {
    return rules.message || `${field} is invalid`;
  }

  return null;
};

