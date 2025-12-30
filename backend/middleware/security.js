const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Helmet security headers with comprehensive configuration
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null, // Only in production
    },
  },
  
  // HTTP Strict Transport Security (HSTS)
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: isProduction, // Enable HSTS preload in production
  },
  
  // X-Frame-Options: Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  
  // X-Content-Type-Options: Prevent MIME type sniffing
  noSniff: true,
  
  // X-DNS-Prefetch-Control: Control DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },
  
  // Referrer-Policy: Control referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Permissions-Policy (formerly Feature-Policy)
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
      payment: ["'none'"],
      usb: ["'none'"],
      magnetometer: ["'none'"],
      gyroscope: ["'none'"],
      accelerometer: ["'none'"],
    },
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disabled for API compatibility
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },
  
  // X-Powered-By: Remove X-Powered-By header
  hidePoweredBy: true,
  
  // Expect-CT: Certificate Transparency
  expectCt: isProduction ? {
    maxAge: 86400, // 1 day
    enforce: true,
  } : false,
  
  // X-Download-Options: Prevent IE from executing downloads
  ieNoOpen: true,
  
  // X-XSS-Protection: Enable XSS filter (legacy, but still useful)
  xssFilter: true,
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test environment
});

// Stricter rate limiting for auth routes
// Skip rate limiting in test environment
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test environment
});

// Stricter rate limiting for sensitive operations
// Skip rate limiting in test environment
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour
  message: 'Too many requests, please try again later.',
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test environment
});

// MongoDB injection prevention
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`MongoDB injection attempt detected: ${key} from IP ${req.ip}`);
  },
});

// HTTP Parameter Pollution prevention
const hppConfig = hpp({
  whitelist: ['page', 'limit', 'sortBy', 'sortOrder'] // Allow these to be arrays
});

// XSS prevention
const xssClean = xss();

// Additional custom security headers middleware
const customSecurityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Additional security headers
  res.setHeader('X-Request-ID', req.id || Date.now().toString());
  
  // Cache control for sensitive endpoints
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/users')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

module.exports = {
  helmetConfig,
  generalLimiter,
  authLimiter,
  strictLimiter,
  mongoSanitizeConfig,
  hppConfig,
  xssClean,
  customSecurityHeaders
};

