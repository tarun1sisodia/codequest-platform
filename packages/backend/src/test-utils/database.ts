import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { ChallengeModel } from '../models/Challenge';
import { SubmissionModel } from '../models/Submission';
import { ConceptModel } from '../models/Concept';

/**
 * Clear all collections in the test database
 */
export async function clearDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

/**
 * Close database connection (useful for tests)
 */
export async function closeDatabase(): Promise<void> {
  await mongoose.connection.close();
}

/**
 * Seed the database with test data
 */
export async function seedTestData(): Promise<{
  user: any;
  challenge: any;
  concept: any;
}> {
  // Create test user
  const user = await UserModel.create({
    githubId: '12345',
    username: 'testuser',
    email: 'test@example.com',
    completedChallenges: [],
    badges: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create test concept
  const concept = await ConceptModel.create({
    name: 'Variables',
    slug: 'variables',
    description: 'Learn about variables in programming',
    category: 'basics',
    order: 1,
    language: 'typescript',
    resources: [],
    examples: [],
    dependencies: [],
  });

  // Create test challenge
  const challenge = await ChallengeModel.create({
    title: 'Hello World',
    slug: 'hello-world',
    description: 'Create a function that returns "Hello, World!"',
    difficulty: 'easy',
    language: 'typescript',
    functionName: 'hello',
    parameterTypes: [],
    returnType: 'string',
    template: 'function hello(): string {\n  // Your code here\n  return "";\n}',
    testCases: [
      {
        input: [],
        expected: 'Hello, World!',
        description: 'Should return Hello, World!',
      },
    ],
    conceptTags: [concept.slug],
    timeLimit: 5000,
    memoryLimit: 128,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { user, challenge, concept };
}

/**
 * Create a test user with optional overrides
 */
export async function createTestUser(overrides: Partial<any> = {}): Promise<any> {
  const defaultUser = {
    githubId: Math.random().toString(),
    username: `testuser${Math.random().toString(36).substr(2, 9)}`,
    email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
    completedChallenges: [],
    badges: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return UserModel.create({ ...defaultUser, ...overrides });
}

/**
 * Create a test challenge with optional overrides
 */
export async function createTestChallenge(overrides: Partial<any> = {}): Promise<any> {
  const defaultChallenge = {
    title: `Test Challenge ${Math.random().toString(36).substr(2, 9)}`,
    slug: `test-challenge-${Math.random().toString(36).substr(2, 9)}`,
    description: 'A test challenge',
    difficulty: 'easy',
    language: 'typescript',
    functionName: 'test',
    parameterTypes: [],
    returnType: 'string',
    template: 'function test(): string {\n  // Your code here\n  return "";\n}',
    testCases: [
      {
        input: [],
        expected: 'test',
        description: 'Should return test',
      },
    ],
    conceptTags: [],
    timeLimit: 5000,
    memoryLimit: 128,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return ChallengeModel.create({ ...defaultChallenge, ...overrides });
}

/**
 * Create a test submission with optional overrides
 */
export async function createTestSubmission(
  userId: string,
  challengeSlug: string,
  overrides: Partial<any> = {}
): Promise<any> {
  const defaultSubmission = {
    userId,
    challengeSlug,
    code: 'function test() { return "test"; }',
    language: 'typescript',
    status: 'passed',
    results: {
      success: true,
      results: [
        {
          passed: true,
          testCase: { input: [], expected: 'test', description: 'Should return test' },
          executionTime: 100,
          memoryUsed: 1024,
        },
      ],
      metrics: {
        totalTime: 100,
        totalMemory: 1024,
        passedTests: 1,
        totalTests: 1,
      },
    },
    submittedAt: new Date(),
  };

  return SubmissionModel.create({ ...defaultSubmission, ...overrides });
}

/**
 * Wait for database operations to complete
 */
export async function waitForDatabase(timeout = 5000): Promise<void> {
  const start = Date.now();
  
  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - start > timeout) {
      throw new Error('Database connection timeout');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}