const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const {
  helmetConfig,
  generalLimiter,
  mongoSanitizeConfig,
  hppConfig,
  xssClean,
  customSecurityHeaders
} = require('./middleware/security');

const app = express();

// Security middleware - must be applied early
app.use(helmetConfig);
app.use(customSecurityHeaders);
app.use(xssClean);
app.use(mongoSanitizeConfig);
app.use(hppConfig);

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Rate limiting
app.use('/api/', generalLimiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drwheels';
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not set, using default: mongodb://localhost:27017/drwheels');
  console.warn('💡 Create a .env file with MONGODB_URI, JWT_SECRET, and other variables');
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('⚠️  Server will continue but database operations will fail');
  console.error('💡 Make sure MongoDB is running: mongod or docker-compose up mongodb');
  // Don't exit - allow server to start for testing without MongoDB
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
