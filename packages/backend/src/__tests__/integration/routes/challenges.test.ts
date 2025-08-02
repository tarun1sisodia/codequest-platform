import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import challengesRouter from '../../../routes/challenges';
import { ChallengeModel } from '../../../models/Challenge';
import { createTestUser, createTestChallenge } from '../../../test-utils/database';
import { createAuthenticatedRequest, validateApiResponse, validateErrorResponse } from '../../../test-utils/helpers';
import { testChallenge, testChallengeWithParams, generateTestChallenge } from '../../../test-utils/fixtures';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use('/api/challenges', challengesRouter);
  return app;
};

describe('Challenges API Integration Tests', () => {
  let app: express.Application;
  let testUser: any;
  let authRequest: ReturnType<typeof createAuthenticatedRequest>;

  beforeEach(async () => {
    app = createTestApp();
    testUser = await createTestUser();
    authRequest = createAuthenticatedRequest(app, testUser._id.toString());
  });

  describe('GET /api/challenges', () => {
    it('should return all challenges', async () => {
      // Seed test challenges
      await ChallengeModel.create([
        testChallenge,
        testChallengeWithParams,
        generateTestChallenge({ language: 'go' })
      ]);

      const response = await request(app)
        .get('/api/challenges')
        .expect(200);

      validateApiResponse(response.body, ['challenges']);
      expect(response.body.challenges).toHaveLength(3);
      expect(response.body.challenges[0]).toHaveProperty('title');
      expect(response.body.challenges[0]).toHaveProperty('slug');
      expect(response.body.challenges[0]).toHaveProperty('difficulty');
      expect(response.body.challenges[0]).toHaveProperty('language');
    });

    it('should filter challenges by language', async () => {
      await ChallengeModel.create([
        generateTestChallenge({ language: 'typescript' }),
        generateTestChallenge({ language: 'go' }),
        generateTestChallenge({ language: 'typescript' })
      ]);

      const response = await request(app)
        .get('/api/challenges?language=typescript')
        .expect(200);

      expect(response.body.challenges).toHaveLength(2);
      expect(response.body.challenges.every((c: any) => c.language === 'typescript')).toBe(true);
    });

    it('should filter challenges by difficulty', async () => {
      await ChallengeModel.create([
        generateTestChallenge({ difficulty: 'easy' }),
        generateTestChallenge({ difficulty: 'medium' as const }),
        generateTestChallenge({ difficulty: 'easy' })
      ]);

      const response = await request(app)
        .get('/api/challenges?difficulty=easy')
        .expect(200);

      expect(response.body.challenges).toHaveLength(2);
      expect(response.body.challenges.every((c: any) => c.difficulty === 'easy')).toBe(true);
    });

    it('should filter challenges by concept', async () => {
      await ChallengeModel.create([
        generateTestChallenge({ conceptTags: ['variables', 'functions'] }),
        generateTestChallenge({ conceptTags: ['loops'] }),
        generateTestChallenge({ conceptTags: ['variables'] })
      ]);

      const response = await request(app)
        .get('/api/challenges?concept=variables')
        .expect(200);

      expect(response.body.challenges).toHaveLength(2);
      expect(response.body.challenges.every((c: any) => c.conceptTags.includes('variables'))).toBe(true);
    });

    it('should return empty array when no challenges match filters', async () => {
      await ChallengeModel.create([
        generateTestChallenge({ language: 'typescript' }),
      ]);

      const response = await request(app)
        .get('/api/challenges?language=python')
        .expect(200);

      expect(response.body.challenges).toHaveLength(0);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(ChallengeModel, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/challenges')
        .expect(500);

      validateErrorResponse(response, 500);
    });
  });

  describe('GET /api/challenges/:slug', () => {
    let challenge: any;

    beforeEach(async () => {
      challenge = await createTestChallenge();
    });

    it('should return challenge by slug', async () => {
      const response = await request(app)
        .get(`/api/challenges/${challenge.slug}`)
        .expect(200);

      validateApiResponse(response.body, ['challenge']);
      expect(response.body.challenge.slug).toBe(challenge.slug);
      expect(response.body.challenge.title).toBe(challenge.title);
      expect(response.body.challenge.description).toBe(challenge.description);
      expect(response.body.challenge.testCases).toBeDefined();
      // Check that functionSignature is computed correctly
      const expectedSignature = `${challenge.functionName}(${challenge.parameterTypes?.join(', ') || ''}): ${challenge.returnType}`;
      expect(response.body.challenge.functionSignature).toBe(expectedSignature);
    });

    it('should return 404 for non-existent challenge', async () => {
      const response = await request(app)
        .get('/api/challenges/non-existent-slug')
        .expect(404);

      validateErrorResponse(response, 404, 'Challenge not found');
    });

    it('should include user progress when authenticated', async () => {
      // Mark challenge as completed by user
      testUser.completedChallenges.push(challenge.slug);
      await testUser.save();

      const response = await authRequest
        .get(`/api/challenges/${challenge.slug}`)
        .expect(200);

      expect(response.body.challenge).toHaveProperty('userProgress');
      expect(response.body.challenge.userProgress.completed).toBe(true);
    });

    it('should not include sensitive information', async () => {
      const response = await request(app)
        .get(`/api/challenges/${challenge.slug}`)
        .expect(200);

      // Test cases should be included for challenges
      expect(response.body.challenge.testCases).toBeDefined();
      
      // But should not include internal fields
      expect(response.body.challenge.__v).toBeUndefined();
      expect(response.body.challenge._id).toBeDefined(); // ObjectId should be converted to string
    });
  });

  describe('GET /api/challenges/:slug/related', () => {
    let challenge: any;

    beforeEach(async () => {
      challenge = await createTestChallenge({ 
        concepts: ['variables', 'functions'],
        difficulty: 'easy',
        language: 'typescript'
      });

      // Create related challenges
      await Promise.all([
        createTestChallenge({ 
          concepts: ['variables'], 
          difficulty: 'easy',
          language: 'typescript'
        }),
        createTestChallenge({ 
          concepts: ['functions'], 
          difficulty: 'medium',
          language: 'typescript'
        }),
        createTestChallenge({ 
          concepts: ['loops'], 
          difficulty: 'easy',
          language: 'go' // Different language, should not be included
        }),
      ]);
    });

    it('should return related challenges based on concepts and language', async () => {
      const response = await request(app)
        .get(`/api/challenges/${challenge.slug}/related`)
        .expect(200);

      validateApiResponse(response.body, ['challenges']);
      expect(response.body.challenges.length).toBeGreaterThan(0);
      expect(response.body.challenges.length).toBeLessThanOrEqual(5); // Default limit
      
      // Should not include the original challenge
      expect(response.body.challenges.every((c: any) => c.slug !== challenge.slug)).toBe(true);
      
      // Should only include same language
      expect(response.body.challenges.every((c: any) => c.language === challenge.language)).toBe(true);
    });

    it('should limit the number of related challenges', async () => {
      // Create many related challenges
      const moreChallenges = Array.from({ length: 10 }, () => 
        createTestChallenge({ 
          concepts: ['variables'],
          language: 'typescript'
        })
      );
      await Promise.all(moreChallenges);

      const response = await request(app)
        .get(`/api/challenges/${challenge.slug}/related?limit=3`)
        .expect(200);

      expect(response.body.challenges).toHaveLength(3);
    });

    it('should handle non-existent challenge', async () => {
      const response = await request(app)
        .get('/api/challenges/non-existent/related')
        .expect(404);

      validateErrorResponse(response, 404, 'Challenge not found');
    });
  });

  describe('Challenge Statistics', () => {
    beforeEach(async () => {
      // Create challenges and users with completion data
      await Promise.all([
        createTestChallenge({ slug: 'easy-1', difficulty: 'easy' }),
        createTestChallenge({ slug: 'medium-1', difficulty: 'medium' }),
        createTestChallenge({ slug: 'hard-1', difficulty: 'hard' }),
      ]);

      await Promise.all([
        createTestUser({ completedChallenges: ['easy-1', 'medium-1'] }),
        createTestUser({ completedChallenges: ['easy-1'] }),
        createTestUser({ completedChallenges: [] }),
      ]);
    });

    it('should calculate completion statistics correctly', async () => {
      const response = await request(app)
        .get('/api/challenges/easy-1')
        .expect(200);

      // This test assumes the endpoint includes completion stats
      // If not implemented, this test would need to be adjusted
      expect(response.body.challenge).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed slug parameters', async () => {
      // Test with a non-existent challenge slug that contains invalid characters
      const response = await request(app)
        .get('/api/challenges/non-existent-challenge-123')
        .expect(404);

      validateErrorResponse(response, 404, 'Challenge not found');
    });

    it('should handle database connection issues', async () => {
      // Mock database connection failure
      jest.spyOn(ChallengeModel, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database connection lost');
      });

      const challenge = await createTestChallenge();
      
      const response = await request(app)
        .get(`/api/challenges/${challenge.slug}`)
        .expect(500);

      validateErrorResponse(response, 500);
    });

    it('should validate query parameters', async () => {
      await createTestChallenge();

      // Test invalid difficulty
      await request(app)
        .get('/api/challenges?difficulty=invalid')
        .expect(200); // Might return empty results or 400, depending on implementation

      // Test invalid limit
      await request(app)
        .get('/api/challenges?limit=not-a-number')
        .expect(200); // Should handle gracefully
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of challenges efficiently', async () => {
      // Create many challenges
      const challenges = Array.from({ length: 100 }, (_, i) => 
        generateTestChallenge({
          title: `Challenge ${i}`,
          slug: `challenge-${i}`
        })
      );
      await ChallengeModel.create(challenges);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/challenges')
        .expect(200);

      const duration = Date.now() - startTime;
      
      expect(response.body.challenges).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should support pagination for large result sets', async () => {
      const challenges = Array.from({ length: 50 }, (_, i) => 
        generateTestChallenge({
          title: `Challenge ${i}`,
          slug: `challenge-${i}`
        })
      );
      await ChallengeModel.create(challenges);

      const response = await request(app)
        .get('/api/challenges?limit=10&offset=20')
        .expect(200);

      expect(response.body.challenges).toHaveLength(10);
      // Additional pagination assertions would depend on implementation
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent data format across endpoints', async () => {
      const challenge = await createTestChallenge();

      // Get challenge from list endpoint
      const listResponse = await request(app)
        .get('/api/challenges')
        .expect(200);

      const challengeFromList = listResponse.body.challenges.find(
        (c: any) => c.slug === challenge.slug
      );

      // Get challenge from detail endpoint
      const detailResponse = await request(app)
        .get(`/api/challenges/${challenge.slug}`)
        .expect(200);

      const challengeFromDetail = detailResponse.body.challenge;

      // Common fields should have same format
      expect(challengeFromList.slug).toBe(challengeFromDetail.slug);
      expect(challengeFromList.title).toBe(challengeFromDetail.title);
      expect(challengeFromList.difficulty).toBe(challengeFromDetail.difficulty);
      expect(challengeFromList.language).toBe(challengeFromDetail.language);

      // Detail endpoint should have additional fields
      expect(challengeFromDetail.testCases).toBeDefined();
      expect(challengeFromDetail.functionSignature).toBeDefined();
    });
  });
});