import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Application } from 'express';
import { config } from '../config';

/**
 * Generate a JWT token for testing
 */
export function generateTestToken(userId: string, additionalPayload: any = {}): string {
  return jwt.sign(
    {
      userId,
      ...additionalPayload,
    },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
}

/**
 * Create authenticated request helper
 */
export function createAuthenticatedRequest(app: Application, userId: string) {
  const token = generateTestToken(userId);
  
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Wait for a specific amount of time (useful for async operations)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock console methods for specific tests
 */
export function mockConsole() {
  const mocks = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  // Store original methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // Replace console methods with mocks
  console.log = mocks.log;
  console.warn = mocks.warn;
  console.error = mocks.error;

  // Return mocks and restore function
  return {
    ...mocks,
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  };
}

/**
 * Mock Docker operations for testing
 */
export function mockDockerExecutor() {
  const mockExecute = jest.fn();
  const mockIsAvailable = jest.fn().mockResolvedValue(true);

  // Mock successful execution by default
  mockExecute.mockResolvedValue({
    success: true,
    results: [
      {
        passed: true,
        testCase: { input: [], expected: 'test', description: 'test' },
        executionTime: 100,
        memoryUsed: 1024,
        expected: 'test',
        actual: 'test',
      },
    ],
    metrics: {
      totalTime: 100,
      totalMemory: 1024,
      passedTests: 1,
      totalTests: 1,
    },
  });

  return {
    mockExecute,
    mockIsAvailable,
    mockImplementation: (implementation: any) => mockExecute.mockImplementation(implementation),
    mockResolvedValue: (value: any) => mockExecute.mockResolvedValue(value),
    mockResolvedValueOnce: (value: any) => mockExecute.mockResolvedValueOnce(value),
    mockRejectedValue: (error: any) => mockExecute.mockRejectedValue(error),
  };
}

/**
 * Create test environment variables
 */
export function setTestEnvironment(overrides: Record<string, string> = {}) {
  const defaultEnv = {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-jwt-secret',
    USE_NATIVE_GO_EXECUTOR: 'false',
    DOCKER_TIMEOUT: '5000',
    DOCKER_MEMORY_LIMIT: '128m',
    AI_API_KEY: 'test-api-key',
    USE_EXTERNAL_AI_API: 'false',
  };

  const testEnv = { ...defaultEnv, ...overrides };

  // Set environment variables
  Object.entries(testEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return testEnv;
}

/**
 * Restore environment variables after test
 */
export function restoreEnvironment(originalEnv: Record<string, string | undefined>) {
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
}

/**
 * Test-specific error classes
 */
export class TestTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestTimeoutError';
  }
}

export class TestSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestSetupError';
  }
}

/**
 * Validate API response structure
 */
export function validateApiResponse(response: any, expectedKeys: string[]) {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');
  
  expectedKeys.forEach(key => {
    expect(response).toHaveProperty(key);
  });
}

/**
 * Validate error response structure
 */
export function validateErrorResponse(response: any, expectedStatus: number, expectedMessage?: string) {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('error');
  
  if (expectedMessage) {
    expect(response.body.error).toContain(expectedMessage);
  }
}

/**
 * Generate random test data
 */
export const generateRandom = {
  string: (length = 10) => Math.random().toString(36).substring(2, length + 2),
  number: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  boolean: () => Math.random() > 0.5,
  email: () => `test${generateRandom.string(8)}@example.com`,
  username: () => `user${generateRandom.string(8)}`,
  githubId: () => generateRandom.number(1000, 999999).toString(),
};

/**
 * Database assertion helpers
 */
export const dbAssertions = {
  async userExists(userId: string) {
    const { UserModel } = await import('../models/User');
    const user = await UserModel.findById(userId);
    expect(user).toBeTruthy();
    return user;
  },
  
  async userDoesNotExist(userId: string) {
    const { UserModel } = await import('../models/User');
    const user = await UserModel.findById(userId);
    expect(user).toBeNull();
  },
  
  async challengeExists(slug: string) {
    const { ChallengeModel } = await import('../models/Challenge');
    const challenge = await ChallengeModel.findOne({ slug });
    expect(challenge).toBeTruthy();
    return challenge;
  },
  
  async submissionExists(userId: string, challengeSlug: string) {
    const { SubmissionModel } = await import('../models/Submission');
    const submission = await SubmissionModel.findOne({ userId, challengeSlug });
    expect(submission).toBeTruthy();
    return submission;
  },
};