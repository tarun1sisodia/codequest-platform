import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Extend Jest matchers
import '@jest/globals';

let mongoServer: MongoMemoryServer;

// Global test setup
beforeAll(async () => {
  // Create MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.0',
    },
  });
  
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  
  console.log(`Connected to test database: ${mongoUri}`);
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('Test database cleaned up');
});

// Clean database between tests
beforeEach(async () => {
  // Get all collections
  const collections = mongoose.connection.collections;
  
  // Clear all collections
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Increase test timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  // Only show console output if TEST_VERBOSE is set
  if (!process.env.TEST_VERBOSE) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;  
  console.error = originalConsoleError;
});

// Global test configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.USE_NATIVE_GO_EXECUTOR = 'false'; // Use Docker for tests
process.env.DOCKER_TIMEOUT = '5000'; // Shorter timeout for tests