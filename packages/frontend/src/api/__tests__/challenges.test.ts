import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api config completely to avoid axios interceptor issues
vi.mock('../config', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { 
  getChallenges, 
  getChallenge, 
  submitSolution 
} from '../challenges';
import { api } from '../config';

const mockApi = vi.mocked(api);

// Mock challenge data
const mockChallenges = [
  {
    _id: '1',
    title: 'Hello World',
    slug: 'hello-world',
    description: 'Create a function that returns "Hello, World!"',
    difficulty: 'easy',
    language: 'typescript',
    concepts: ['variables', 'functions'],
  },
];

const mockChallenge = {
  _id: '1',
  title: 'Hello World',
  slug: 'hello-world',
  description: 'Create a function that returns "Hello, World!"',
  difficulty: 'easy',
  language: 'typescript',
  functionSignature: 'function hello(): string',
  templateCode: 'function hello(): string {\n  // Your code here\n}',
  testCases: [
    {
      input: [],
      expected: 'Hello, World!',
      description: 'Should return Hello, World!',
    },
  ],
  concepts: ['variables', 'functions'],
  timeLimit: 5000,
  memoryLimit: 128,
};

const mockSubmissionResult = {
  submission: {
    _id: 'sub1',
    code: 'function hello(): string { return "Hello, World!"; }',
    language: 'typescript',
  },
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
      },
    ],
  },
};

describe('Challenges API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChallenges', () => {
    it('should fetch challenges successfully', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: mockChallenges,
      });

      const result = await getChallenges();

      expect(mockApi.get).toHaveBeenCalledWith('/api/challenges');
      expect(result).toEqual(mockChallenges);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(getChallenges()).rejects.toThrow('Network Error');
    });
  });

  describe('getChallenge', () => {
    it('should fetch a single challenge successfully', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: mockChallenge,
      });

      const result = await getChallenge('hello-world');

      expect(mockApi.get).toHaveBeenCalledWith('/api/challenges/hello-world');
      expect(result).toEqual(mockChallenge);
    });

    it('should handle challenge not found', async () => {
      mockApi.get.mockRejectedValueOnce({
        response: { status: 404, data: { error: 'Challenge not found' } },
      });

      await expect(getChallenge('non-existent')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('submitSolution', () => {
    it('should submit solution successfully', async () => {
      mockApi.post.mockResolvedValueOnce({
        data: mockSubmissionResult,
      });

      const result = await submitSolution('hello-world', 'function hello(): string { return "Hello, World!"; }', 'typescript');

      expect(mockApi.post).toHaveBeenCalledWith('/api/submissions', {
        challengeSlug: 'hello-world',
        code: 'function hello(): string { return "Hello, World!"; }',
        language: 'typescript',
      });
      expect(result).toEqual(mockSubmissionResult);
    });

    it('should handle validation errors', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Code is required' },
        },
      });

      await expect(submitSolution('hello-world', '', 'typescript')).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });
});