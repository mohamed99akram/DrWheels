const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Car validation rules
const validateCreateCar = [
  body('make')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Make must be between 1 and 50 characters')
    .escape(),
  body('model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model must be between 1 and 50 characters')
    .escape(),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage must be a non-negative integer'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color must be less than 30 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters')
    .escape(),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  handleValidationErrors
];

const validateUpdateCar = [
  body('make')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Make must be between 1 and 50 characters')
    .escape(),
  body('model')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model must be between 1 and 50 characters')
    .escape(),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage must be a non-negative integer'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color must be less than 30 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters')
    .escape(),
  body('status')
    .optional()
    .isIn(['available', 'sold', 'pending'])
    .withMessage('Status must be one of: available, sold, pending'),
  handleValidationErrors
];

const validateCarId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid car ID'),
  handleValidationErrors
];

// Order validation rules
const validateCreateOrder = [
  body('carId')
    .isMongoId()
    .withMessage('Invalid car ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
    .escape(),
  handleValidationErrors
];

const validateOrderId = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  handleValidationErrors
];

const validateOrderIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  handleValidationErrors
];

const validateUpdateOrderStatus = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, completed, cancelled'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'refunded'])
    .withMessage('Payment status must be one of: pending, paid, refunded'),
  handleValidationErrors
];

// Review validation rules
const validateCreateReview = [
  param('carId')
    .isMongoId()
    .withMessage('Invalid car ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty if provided')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .escape(),
  handleValidationErrors
];

const validateReviewId = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),
  handleValidationErrors
];

const validateUpdateReview = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters')
    .escape(),
  handleValidationErrors
];

// Query validation
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'year', 'mileage', 'averageRating'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('minYear')
    .optional()
    .isInt({ min: 1900 })
    .withMessage('Min year must be a valid year'),
  query('maxYear')
    .optional()
    .isInt({ min: 1900 })
    .withMessage('Max year must be a valid year'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateCar,
  validateUpdateCar,
  validateCarId,
  validateCreateOrder,
  validateOrderId,
  validateOrderIdParam,
  validateUpdateOrderStatus,
  validateCreateReview,
  validateReviewId,
  validateUpdateReview,
  validateQueryParams,
  handleValidationErrors
};

