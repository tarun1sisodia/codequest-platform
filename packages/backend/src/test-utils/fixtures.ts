import { TestCase } from '../types';
import { BadgeModel } from '../models/Badge';
import { Types } from 'mongoose';

/**
 * Test user fixtures
 */
export const testUser = {
  githubId: '12345',
  username: 'testuser',
  email: 'test@example.com',
  completedChallenges: [],
  badges: [], // Default to empty array - tests will add badges as needed
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testUserWithProgress = {
  ...testUser,
  githubId: '67890',
  username: 'progressuser',
  email: 'progress@example.com',
  completedChallenges: ['hello-world', 'fizz-buzz', 'reverse-string'],
  badges: [], // Default to empty array - tests will add badges as needed
};

/**
 * Test challenge fixtures
 */
export const testChallenge = {
  title: 'Hello World',
  slug: 'hello-world',
  description: 'Create a function that returns "Hello, World!"',
  difficulty: 'easy' as const,
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
  ] as TestCase[],
  conceptTags: ['variables'],
  timeLimit: 5000,
  memoryLimit: 128,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testChallengeWithParams = {
  title: 'Add Numbers',
  slug: 'add-numbers',
  description: 'Create a function that adds two numbers',
  difficulty: 'easy' as const,
  language: 'typescript',
  functionName: 'add',
  parameterTypes: ['number', 'number'],
  returnType: 'number',
  template: 'function add(a: number, b: number): number {\n  // Your code here\n  return 0;\n}',
  testCases: [
    {
      input: [2, 3],
      expected: 5,
      description: 'Should add 2 + 3 = 5',
    },
    {
      input: [10, 15],
      expected: 25,
      description: 'Should add 10 + 15 = 25',
    },
  ] as TestCase[],
  conceptTags: ['functions', 'arithmetic'],
  timeLimit: 5000,
  memoryLimit: 128,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testGoChallenge = {
  title: 'Go Hello World',
  slug: 'go-hello-world',
  description: 'Create a function that returns "Hello, World!" in Go',
  difficulty: 'easy' as const,
  language: 'go',
  functionName: 'hello',
  parameterTypes: [],
  returnType: 'string',
  template: 'func hello() string {\n    // Your code here\n    return ""\n}',
  testCases: [
    {
      input: [],
      expected: 'Hello, World!',
      description: 'Should return Hello, World!',
    },
  ] as TestCase[],
  conceptTags: ['variables'],
  timeLimit: 5000,
  memoryLimit: 128,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Test concept fixtures
 */
export const testConcept = {
  name: 'Variables',
  slug: 'variables',
  description: 'Learn about variables in programming',
  category: 'basics',
  order: 1,
  language: 'typescript',
  resources: [
    {
      title: 'Variables Guide',
      url: 'https://example.com/variables',
      type: 'article' as const,
    },
  ],
  examples: [
    {
      title: 'Basic Variable',
      code: 'let message = "Hello";',
      explanation: 'This creates a variable called message',
    },
  ],
  dependencies: [],
};

/**
 * Test submission fixtures
 */
export const testSubmission = {
  userId: 'user123',
  challengeSlug: 'hello-world',
  code: 'function hello(): string {\n  return "Hello, World!";\n}',
  language: 'typescript',
  status: 'passed' as const,
  results: {
    success: true,
    results: [
      {
        passed: true,
        testCase: {
          input: [],
          expected: 'Hello, World!',
          description: 'Should return Hello, World!',
        },
        executionTime: 150,
        memoryUsed: 1024,
        expected: 'Hello, World!',
        actual: 'Hello, World!',
      },
    ],
    metrics: {
      totalTime: 150,
      totalMemory: 1024,
      passedTests: 1,
      totalTests: 1,
    },
  },
  submittedAt: new Date('2024-01-01'),
};

export const testFailedSubmission = {
  ...testSubmission,
  status: 'failed' as const,
  code: 'function hello(): string {\n  return "Wrong answer";\n}',
  results: {
    success: false,
    results: [
      {
        passed: false,
        testCase: {
          input: [],
          expected: 'Hello, World!',
          description: 'Should return Hello, World!',
        },
        executionTime: 120,
        memoryUsed: 1024,
        expected: 'Hello, World!',
        actual: 'Wrong answer',
        error: 'Expected "Hello, World!" but got "Wrong answer"',
      },
    ],
    metrics: {
      totalTime: 120,
      totalMemory: 1024,
      passedTests: 0,
      totalTests: 1,
    },
  },
};

/**
 * Test certificate fixtures
 */
export const testCertificate = {
  userId: 'user123',
  language: 'typescript',
  challengesCompleted: ['hello-world', 'add-numbers', 'reverse-string'],
  dateEarned: new Date('2024-01-01'),
  certificateUrl: 'https://example.com/cert123.pdf',
};

/**
 * Mock data generators
 */
export function generateTestUser(overrides: any = {}) {
  return {
    ...testUser,
    githubId: Math.random().toString(),
    username: `user${Math.random().toString(36).substr(2, 9)}`,
    email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
    ...overrides,
  };
}

export function generateTestChallenge(overrides: any = {}) {
  const id = Math.random().toString(36).substr(2, 9);
  return {
    ...testChallenge,
    title: `Test Challenge ${id}`,
    slug: `test-challenge-${id}`,
    functionName: `testFunction${id}`,
    ...overrides,
  };
}

/**
 * AI Assistant test responses
 */
export const testAIResponses = {
  hint: {
    level: 1,
    content: 'Think about what the function should return. Look at the test case to see the expected output.',
    type: 'hint' as const,
  },
  concept: {
    level: 2,
    content: 'In TypeScript, functions can return values using the `return` statement. String literals are enclosed in quotes.',
    type: 'concept' as const,
  },
  approach: {
    level: 3,
    content: '1. Look at the function signature\n2. Check what the test expects\n3. Return that exact string',
    type: 'approach' as const,
  },
  pseudocode: {
    level: 4,
    content: '```\nfunction hello():\n  return "Hello, World!"\n```',
    type: 'pseudocode' as const,
  },
  codeSnippet: {
    level: 5,
    content: '```typescript\nreturn "Hello, World!";\n```',
    type: 'code' as const,
  },
};

/**
 * Test badge fixtures
 */
export const testBadgeData = {
  typescriptBeginner: {
    conceptTag: 'typescript-beginner',
    name: 'TypeScript Beginner',
    description: 'Completed all TypeScript beginner challenges',
    icon: '/badges/typescript-beginner.svg',
  },
  stringMaster: {
    conceptTag: 'string-master',
    name: 'String Master',
    description: 'Mastered string manipulation challenges',
    icon: '/badges/string-master.svg',
  },
  functions: {
    conceptTag: 'functions',
    name: 'Function Expert',
    description: 'Expert at working with functions',
    icon: '/badges/functions.svg',
  },
};

/**
 * Helper function to create test badges and return their ObjectIds
 */
export async function createTestBadges(badgeNames: string[] = []): Promise<Types.ObjectId[]> {
  const badges = [];
  
  for (const badgeName of badgeNames) {
    const badgeData = testBadgeData[badgeName as keyof typeof testBadgeData];
    if (badgeData) {
      const badge = new BadgeModel(badgeData);
      await badge.save();
      badges.push(badge._id);
    }
  }
  
  return badges;
}

/**
 * Helper function to create a single test badge
 */
export async function createTestBadge(conceptTag: string): Promise<Types.ObjectId> {
  const badgeData = testBadgeData[conceptTag as keyof typeof testBadgeData] || {
    conceptTag,
    name: `Test ${conceptTag}`,
    description: `Test badge for ${conceptTag}`,
    icon: `/badges/${conceptTag}.svg`,
  };
  
  const badge = new BadgeModel(badgeData);
  await badge.save();
  return badge._id;
}