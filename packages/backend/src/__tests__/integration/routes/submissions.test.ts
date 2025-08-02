// Mock the executor service first
const mockExecute = jest.fn();
jest.mock('../../../services/executor', () => ({
  CodeExecutor: jest.fn().mockImplementation(() => ({
    executeCode: mockExecute,
  })),
}));

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import submissionsRouter from '../../../routes/submissions';
import { authMiddleware } from '../../../middleware/auth';
import { SubmissionModel } from '../../../models/Submission';
import { ChallengeModel } from '../../../models/Challenge';
import { UserModel } from '../../../models/User';
import { createTestUser, createTestChallenge } from '../../../test-utils/database';
import { createAuthenticatedRequest, validateApiResponse, validateErrorResponse } from '../../../test-utils/helpers';
import { testChallenge, testSubmission, testFailedSubmission } from '../../../test-utils/fixtures';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use('/api/submissions', authMiddleware, submissionsRouter);
  return app;
};

describe('Submissions API Integration Tests', () => {
  let app: express.Application;
  let testUser: any;
  let testChallengeData: any;
  let authRequest: ReturnType<typeof createAuthenticatedRequest>;

  beforeEach(async () => {
    app = createTestApp();
    testUser = await createTestUser();
    testChallengeData = await createTestChallenge(testChallenge);
    authRequest = createAuthenticatedRequest(app, testUser._id.toString());
    
    // Reset executor mock with default successful response
    mockExecute.mockClear();
    mockExecute.mockResolvedValue({
      success: true,
      results: [
        {
          passed: true,
          testCase: { input: [], expected: 'Hello, World!', description: 'Should return Hello, World!' },
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
    });
  });

  describe('POST /api/submissions', () => {
    const validSubmissionData = {
      challengeSlug: 'hello-world',
      code: 'function hello(): string { return "Hello, World!"; }',
      language: 'typescript',
    };


    it('should submit and execute code successfully', async () => {
      const response = await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
        })
        .expect(200);

      validateApiResponse(response.body, ['submission', 'results']);
      expect(response.body.submission.status).toBe('passed');
      expect(response.body.results.success).toBe(true);
      expect(response.body.results.results[0].passed).toBe(true);

      // Verify submission was saved to database
      const savedSubmission = await SubmissionModel.findOne({
        userId: testUser._id,
        challengeSlug: testChallengeData.slug,
      });
      expect(savedSubmission).toBeTruthy();
      expect(savedSubmission?.code).toBe(validSubmissionData.code);
    });

    it('should handle failed code execution', async () => {
      // Mock failed execution
      mockExecute.mockResolvedValue({
        success: false,
        results: [
          {
            passed: false,
            testCase: { input: [], expected: 'Hello, World!', description: 'Should return Hello, World!' },
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
      });

      const response = await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
          code: 'function hello(): string { return "Wrong answer"; }',
        })
        .expect(200);

      expect(response.body.submission.status).toBe('failed');
      expect(response.body.results.success).toBe(false);
      expect(response.body.results.results[0].passed).toBe(false);
    });

    it('should update user progress on successful submission', async () => {
      expect(testUser.completedChallenges).not.toContain(testChallengeData.slug);

      await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
        })
        .expect(200);

      // Refresh user from database
      const updatedUser = await UserModel.findById(testUser._id);
      expect(updatedUser?.completedChallenges).toContain(testChallengeData.slug);
    });

    it('should not update progress on failed submission', async () => {
      // Mock failed execution
      mockExecute.mockResolvedValue({
        success: false,
        results: [{ passed: false }],
        metrics: { passedTests: 0, totalTests: 1 },
      });

      expect(testUser.completedChallenges).not.toContain(testChallengeData.slug);

      await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
          code: 'function hello(): string { return "Wrong"; }',
        })
        .expect(200);

      const updatedUser = await UserModel.findById(testUser._id);
      expect(updatedUser?.completedChallenges).not.toContain(testChallengeData.slug);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/submissions')
        .send(validSubmissionData)
        .expect(401);

      validateErrorResponse(response, 401, 'Authentication required');
    });

    it('should validate required fields', async () => {
      // Missing challengeSlug
      let response = await authRequest
        .post('/api/submissions')
        .send({
          code: validSubmissionData.code,
          language: validSubmissionData.language,
        })
        .expect(400);

      validateErrorResponse(response, 400);

      // Missing code
      response = await authRequest
        .post('/api/submissions')
        .send({
          challengeSlug: validSubmissionData.challengeSlug,
          language: validSubmissionData.language,
        })
        .expect(400);

      validateErrorResponse(response, 400);

      // Missing language
      response = await authRequest
        .post('/api/submissions')
        .send({
          challengeSlug: validSubmissionData.challengeSlug,
          code: validSubmissionData.code,
        })
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should validate challenge exists', async () => {
      const response = await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: 'non-existent-challenge',
        })
        .expect(404);

      validateErrorResponse(response, 404, 'Challenge not found');
    });

    it('should validate language matches challenge', async () => {
      const response = await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
          language: 'javascript', // Challenge is TypeScript
        })
        .expect(400);

      validateErrorResponse(response, 400, 'Language mismatch');
    });

    it('should handle code too long', async () => {
      const longCode = 'a'.repeat(10001); // Assuming 10KB limit

      const response = await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
          code: longCode,
        })
        .expect(400);

      validateErrorResponse(response, 400, 'Code too long');
    });

    it('should handle execution timeout', async () => {
      // Mock timeout error
      mockExecute.mockRejectedValue(new Error('Execution timeout'));

      const response = await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
        })
        .expect(500);

      validateErrorResponse(response, 500, 'Execution failed');
    });

    it('should track multiple submissions for same challenge', async () => {
      // First submission (failed)
      mockExecute.mockResolvedValueOnce({
        success: false,
        results: [{ passed: false }],
        metrics: { passedTests: 0, totalTests: 1 },
      });

      await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
          code: 'function hello(): string { return "Wrong"; }',
        })
        .expect(200);

      // Second submission (passed)
      mockExecute.mockResolvedValueOnce({
        success: true,
        results: [{ passed: true }],
        metrics: { passedTests: 1, totalTests: 1 },
      });

      await authRequest
        .post('/api/submissions')
        .send({
          ...validSubmissionData,
          challengeSlug: testChallengeData.slug,
          code: 'function hello(): string { return "Hello, World!"; }',
        })
        .expect(200);

      // Check both submissions exist
      const submissions = await SubmissionModel.find({
        userId: testUser._id,
        challengeSlug: testChallengeData.slug,
      });
      expect(submissions).toHaveLength(2);
      // Note: Submission model doesn't have status property, checking based on results
      expect(submissions[0].results.some((r: any) => !r.passed)).toBe(true);
      expect(submissions[1].results.every((r: any) => r.passed)).toBe(true);
    });
  });

  describe('GET /api/submissions', () => {
    beforeEach(async () => {
      // Create test submissions
      await SubmissionModel.create([
        {
          ...testSubmission,
          userId: testUser._id,
          challengeSlug: testChallengeData.slug,
        },
        {
          ...testFailedSubmission,
          userId: testUser._id,
          challengeSlug: testChallengeData.slug,
        },
      ]);
    });

    it('should return user submissions', async () => {
      const response = await authRequest
        .get('/api/submissions')
        .expect(200);

      validateApiResponse(response.body, ['submissions']);
      expect(response.body.submissions).toHaveLength(2);
      expect(response.body.submissions[0]).toHaveProperty('challengeSlug');
      expect(response.body.submissions[0]).toHaveProperty('status');
      expect(response.body.submissions[0]).toHaveProperty('createdAt');
    });

    it('should filter submissions by challenge', async () => {
      const response = await authRequest
        .get(`/api/submissions?challengeSlug=${testChallengeData.slug}`)
        .expect(200);

      expect(response.body.submissions).toHaveLength(2);
      expect(response.body.submissions.every((s: any) => s.challengeSlug === testChallengeData.slug)).toBe(true);
    });

    it('should filter submissions by status', async () => {
      const response = await authRequest
        .get('/api/submissions?status=passed')
        .expect(200);

      expect(response.body.submissions).toHaveLength(1);
      expect(response.body.submissions[0].status).toBe('passed');
    });

    it('should paginate submissions', async () => {
      // Create more submissions
      const moreSubmissions = Array.from({ length: 15 }, (_, i) => ({
        ...testSubmission,
        userId: testUser._id,
        challengeSlug: `challenge-${i}`,
        submittedAt: new Date(Date.now() - i * 1000), // Different times
      }));
      await SubmissionModel.create(moreSubmissions);

      const response = await authRequest
        .get('/api/submissions?limit=10&offset=5')
        .expect(200);

      expect(response.body.submissions).toHaveLength(10);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.total).toBeGreaterThan(15);
    });

    it('should return only user own submissions', async () => {
      // Create another user with submissions
      const otherUser = await createTestUser();
      await SubmissionModel.create({
        ...testSubmission,
        userId: otherUser._id,
        challengeSlug: 'other-challenge',
      });

      const response = await authRequest
        .get('/api/submissions')
        .expect(200);

      // Should only return current user's submissions
      expect(response.body.submissions.every((s: any) => s.userId === testUser._id.toString())).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/submissions')
        .expect(401);

      validateErrorResponse(response, 401);
    });
  });

  describe('GET /api/submissions/:id', () => {
    let submission: any;

    beforeEach(async () => {
      submission = await SubmissionModel.create({
        ...testSubmission,
        userId: testUser._id,
        challengeSlug: testChallengeData.slug,
      });
    });

    it('should return submission details', async () => {
      const response = await authRequest
        .get(`/api/submissions/${submission._id}`)
        .expect(200);

      validateApiResponse(response.body, ['submission']);
      expect(response.body.submission._id).toBe(submission._id.toString());
      expect(response.body.submission.code).toBe(submission.code);
      expect(response.body.submission.results).toBeDefined();
    });

    it('should not return other users submissions', async () => {
      const otherUser = await createTestUser();
      const otherSubmission = await SubmissionModel.create({
        ...testSubmission,
        userId: otherUser._id,
        challengeSlug: testChallengeData.slug,
      });

      const response = await authRequest
        .get(`/api/submissions/${otherSubmission._id}`)
        .expect(404);

      validateErrorResponse(response, 404, 'Submission not found');
    });

    it('should return 404 for non-existent submission', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await authRequest
        .get(`/api/submissions/${fakeId}`)
        .expect(404);

      validateErrorResponse(response, 404, 'Submission not found');
    });

    it('should validate ObjectId format', async () => {
      const response = await authRequest
        .get('/api/submissions/invalid-id')
        .expect(400);

      validateErrorResponse(response, 400, 'Invalid submission ID');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle concurrent submissions', async () => {
      const submissionPromises = Array.from({ length: 5 }, (_, i) =>
        authRequest
          .post('/api/submissions')
          .send({
            challengeSlug: testChallengeData.slug,
            code: `function hello(): string { return "Hello ${i}"; }`,
            language: 'typescript',
          })
      );

      const responses = await Promise.all(submissionPromises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      const submissions = await SubmissionModel.find({
        userId: testUser._id,
        challengeSlug: testChallengeData.slug,
      });
      expect(submissions).toHaveLength(5);
    });

    it('should handle large code submissions', async () => {
      const largeCode = `
        function hello(): string {
          // Large comment block
          ${Array.from({ length: 100 }, (_, i) => `// Comment line ${i}`).join('\n          ')}
          return "Hello, World!";
        }
      `;

      const response = await authRequest
        .post('/api/submissions')
        .send({
          challengeSlug: testChallengeData.slug,
          code: largeCode,
          language: 'typescript',
        })
        .expect(200);

      expect(response.body.submission.code).toBe(largeCode);
    });

    it('should handle special characters in code', async () => {
      const codeWithSpecialChars = `
        function hello(): string {
          const greeting = "Hello, 世界! 🌍";
          return greeting;
        }
      `;

      const response = await authRequest
        .post('/api/submissions')
        .send({
          challengeSlug: testChallengeData.slug,
          code: codeWithSpecialChars,
          language: 'typescript',
        })
        .expect(200);

      expect(response.body.submission.code).toBe(codeWithSpecialChars);
    });
  });

  describe('Certificate Generation', () => {
    it('should trigger certificate generation on language completion', async () => {
      // This test would need to be implemented based on your certificate logic
      // For now, it's a placeholder showing the test structure
      
      // Mock scenario: user completes all TypeScript challenges
      const typescriptChallenges = await ChallengeModel.find({ language: 'typescript' });
      
      // Complete all but one challenge
      testUser.completedChallenges = typescriptChallenges.slice(0, -1).map(c => c.slug);
      await testUser.save();

      // Submit the last challenge
      await authRequest
        .post('/api/submissions')
        .send({
          challengeSlug: typescriptChallenges[typescriptChallenges.length - 1].slug,
          code: 'function test(): string { return "test"; }',
          language: 'typescript',
        })
        .expect(200);

      // Verify certificate was created (this would need actual implementation)
      // const certificate = await CertificateModel.findOne({ userId: testUser._id, language: 'typescript' });
      // expect(certificate).toBeTruthy();
    });
  });
});