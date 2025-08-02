import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ConceptModel } from "../models/Concept";
import { ChallengeModel } from "../models/Challenge";
import { UserModel } from "../models/User";
import mongoose from "mongoose";

const router = Router();

// Define Challenge with completed property as a simple interface
interface ChallengeWithStatus {
  _id: mongoose.Types.ObjectId | string;
  slug: string; // Added slug property
  title: string;
  difficulty: string;
  conceptTags?: string[];
  language: string;
  points?: number;
  completed?: boolean;
  [key: string]: any;
}

// Helper function to try authentication
const tryAuth = async (
  req: Request,
  res: Response,
): Promise<mongoose.Types.ObjectId | null> => {
  if (req.headers.authorization) {
    try {
      // Apply auth middleware
      await new Promise<void>((resolve) => {
        authMiddleware(req, res, () => resolve());
      });

      // If we get here, authentication was successful
      // Cast req to AuthRequest to access user
      return (req as unknown as AuthRequest).user?._id || null;
    } catch (error) {
      // Authentication failed, continue as guest
      return null;
    }
  }
  return null;
};

// Get learning path with progress (public route with optional auth)
router.get("/path", async (req: Request, res: Response) => {
  try {
    // Try to authenticate user
    const userId = await tryAuth(req, res);

    const language = (req.query.language as string) || "all";

    // Get concepts in order
    const concepts = await ConceptModel.find({
      $or: [{ language: "all" }, { language }],
    }).sort({ order: 1 });

    // Get all challenges organized by concept
    const challengeDocs = await ChallengeModel.find({
      language,
      conceptTags: { $exists: true, $ne: [] },
    }).lean();

    // Convert to our interface type with completed property
    const challenges: ChallengeWithStatus[] = challengeDocs.map((doc) => ({
      ...doc,
      _id: doc._id,
      completed: false,
    }));

    // Organize challenges by concept
    const challengesByConceptMap = challenges.reduce(
      (acc, challenge) => {
        if (!challenge.conceptTags) return acc;

        challenge.conceptTags.forEach((concept) => {
          if (!acc[concept]) acc[concept] = [];
          acc[concept].push(challenge);
        });
        return acc;
      },
      {} as Record<string, ChallengeWithStatus[]>,
    );

    // If user is authenticated, update completion status
    if (userId) {
      const userProgress = await UserModel.findById(userId)
        .select("completedChallenges progress")
        .lean();

      if (userProgress?.completedChallenges) {
        const completedSlugs = new Set(userProgress.completedChallenges);

        // Update completion status for each challenge
        Object.keys(challengesByConceptMap).forEach((concept) => {
          challengesByConceptMap[concept].forEach((challenge) => {
            if (completedSlugs.has(challenge.slug)) {
              challenge.completed = true;
            }
          });
        });
      }
    }

    // Build learning path with progress
    const learningPath = concepts.map((concept) => {
      const conceptChallenges = challengesByConceptMap[concept.slug] || [];
      const completedCount = conceptChallenges.filter(
        (challenge) => challenge.completed === true,
      ).length;

      return {
        ...concept.toObject(),
        challenges: conceptChallenges,
        progress: {
          completed: completedCount,
          total: conceptChallenges.length,
          percentage:
            conceptChallenges.length > 0
              ? Math.floor((completedCount / conceptChallenges.length) * 100)
              : 0,
        },
        unlocked:
          !concept.dependencies ||
          concept.dependencies.every((dep) => {
            const depChallenges = challengesByConceptMap[dep] || [];
            return (
              depChallenges.length === 0 ||
              depChallenges.some((c) => c.completed === true)
            );
          }),
      };
    });

    res.json(learningPath);
  } catch (error) {
    console.error("Error fetching learning path:", error);
    res.status(500).json({ error: "Failed to fetch learning path" });
  }
});

// Get concept details with challenges (with optional auth)
router.get("/concept/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Try to authenticate user
    const userId = await tryAuth(req, res);

    const concept = await ConceptModel.findOne({ slug });
    if (!concept) {
      return res.status(404).json({ error: "Concept not found" });
    }

    // Get challenges as plain objects
    const challengeDocs = await ChallengeModel.find({
      conceptTags: slug,
    })
      .sort({ difficulty: 1, points: 1 })
      .lean();

    // Convert to our interface type with completed property
    const challengesWithStatus: ChallengeWithStatus[] = challengeDocs.map(
      (doc) => ({
        ...doc,
        _id: doc._id,
        completed: false,
      }),
    );

    // If user is authenticated, update completion status
    if (userId) {
      const user = await UserModel.findById(userId)
        .select("completedChallenges")
        .lean();

      if (user?.completedChallenges) {
        const completedSlugs = new Set(user.completedChallenges);

        challengesWithStatus.forEach((challenge) => {
          if (completedSlugs.has(challenge.slug)) {
            challenge.completed = true;
          }
        });
      }
    }

    res.json({
      concept,
      challenges: challengesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching concept:", error);
    res.status(500).json({ error: "Failed to fetch concept" });
  }
});

export default router;
