const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  console.log('🔧 Setting up MongoDB Memory Server for tests...');
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log(`📦 MongoDB Memory Server URI: ${mongoUri}`);
  
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Memory Server');
  console.log(`   Database: ${mongoose.connection.name}`);
  console.log(`   Ready State: ${mongoose.connection.readyState} (1=connected)`);
}, 30000);

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 30000);

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

