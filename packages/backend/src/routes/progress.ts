import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ChallengeModel } from "../models/Challenge";
import { UserModel } from "../models/User";
import { BadgeModel, IBadge } from "../models/Badge";

// Define a type guard to check if something is an IBadge
function isBadge(obj: any): obj is IBadge {
  return obj && typeof obj.conceptTag === "string";
}

const router = Router();

// Get user progress for a specific concept
router.get(
  "/user/progress",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { conceptTag } = req.query;
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      if (!conceptTag || typeof conceptTag !== "string") {
        return res.status(400).json({ error: "Valid concept tag is required" });
      }

      // Get the user and populate badges
      const user = await UserModel.findById(userId).populate("badges").lean();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get all challenges for this concept
      const challenges = await ChallengeModel.find({
        conceptTags: conceptTag,
      })
        .sort({ order: 1 })
        .lean();

      // Get completed challenges
      const completedChallenges = user.completedChallenges || [];

      // Count completed challenges in this concept
      const completedInConcept = challenges.filter((challenge) =>
        completedChallenges.includes(challenge.slug)
      ).length;

      // Check if badge already earned - handle populated and unpopulated badges
      const badges = user.badges as unknown[];
      const earnedBadge =
        (badges &&
          badges.some((badge) => {
            // Check if it's a populated badge object or just an ID
            return isBadge(badge) ? badge.conceptTag === conceptTag : false;
          })) ||
        false;

      res.json({
        completed: completedInConcept,
        totalChallenges: challenges.length,
        earnedBadge,
        completedChallenges: completedChallenges, // Already strings (slugs)
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({
        error: "Failed to fetch progress",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// Get next challenge in sequence
router.get("/next-challenge", async (req, res) => {
  try {
    const { conceptTag, currentSlug } = req.query;
    console.log("Request params:", { conceptTag, currentSlug });

    if (!conceptTag || typeof conceptTag !== "string") {
      return res.status(400).json({ error: "Concept tag is required" });
    }

    if (!currentSlug || typeof currentSlug !== "string") {
      return res
        .status(400)
        .json({ error: "Current challenge slug is required" });
    }

    // Get all challenges for this concept
    console.log("Finding challenges with conceptTag:", conceptTag);
    const challenges = await ChallengeModel.find({
      conceptTags: conceptTag,
    }).lean();

    console.log(`Found ${challenges.length} challenges`);

    if (challenges.length === 0) {
      return res
        .status(404)
        .json({ error: "No challenges found for this concept" });
    }

    // Log each challenge briefly to verify the data
    challenges.forEach((c, i) => {
      console.log(`Challenge ${i + 1}:`, {
        slug: c.slug,
        title: c.title,
      });
    });

    // Find the index of the current challenge
    const currentIndex = challenges.findIndex(
      (c) => c.slug === currentSlug,
    );

    console.log("Current challenge index:", currentIndex);

    if (currentIndex === -1) {
      return res.status(404).json({ error: "Current challenge not found" });
    }

    // Get the next challenge
    const nextChallenge = challenges[currentIndex + 1] || null;
    console.log(
      "Next challenge:",
      nextChallenge
        ? { slug: nextChallenge.slug, title: nextChallenge.title }
        : "None available",
    );

    res.json(nextChallenge);
  } catch (error) {
    console.error("Error getting next challenge:", error);
    res.status(500).json({
      error: "Failed to get next challenge",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Award badge for concept completion
router.post(
  "/user/badges",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { conceptTag } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      if (!conceptTag) {
        return res.status(400).json({ error: "Concept tag is required" });
      }

      // Get all challenges for the concept
      const challenges = await ChallengeModel.find({
        conceptTags: conceptTag,
      }).lean();

      if (challenges.length === 0) {
        return res
          .status(404)
          .json({ error: "No challenges found for this concept" });
      }

      // Get the user and populate badges
      const user = await UserModel.findById(userId).populate("badges").lean();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if all challenges are completed
      const completedChallenges = user.completedChallenges || [];
      const allCompleted = challenges.every((challenge) =>
        completedChallenges.includes(challenge.slug)
      );

      if (!allCompleted) {
        return res.status(400).json({
          error: "Not all challenges are completed for this concept",
        });
      }

      // Check if badge already earned
      const badges = user.badges as unknown[];
      const existingBadge =
        badges &&
        badges.find(
          (badge) => isBadge(badge) && badge.conceptTag === conceptTag,
        );

      if (existingBadge) {
        return res.json({
          message: "Badge already earned",
          badge: existingBadge,
        });
      }

      // Format the concept tag for display
      const conceptName = conceptTag
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Create the badge in the Badge collection
      const badgeData: IBadge = {
        conceptTag,
        name: `${conceptName} Master`,
        description: `Mastered all ${conceptName} challenges`,
        earnedAt: new Date(),
        icon: `/badges/${conceptTag}.svg`,
      };

      const newBadge = await BadgeModel.create(badgeData);

      // Update user with new badge reference
      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: { badges: newBadge._id },
      });

      res.json({
        message: "Badge awarded successfully",
        badge: newBadge,
      });
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({
        error: "Failed to award badge",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// Get all user badges
router.get(
  "/user/badges",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      const user = await UserModel.findById(userId).populate("badges").lean();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return the populated badges
      const badges = user.badges || [];
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({
        error: "Failed to fetch badges",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

export default router;
