import { Router, Request, Response } from "express";
import { UserModel } from "../models/User";
import { BadgeModel } from "../models/Badge";

const router = Router();

// GET /api/leaderboard - Get top users ranked by achievements and progress
router.get("/", async (req: Request, res: Response) => {
  try {
    // Get query parameters with defaults
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    const sort = (req.query.sort as string) || "points"; // points, badges, challenges

    // Aggregate pipeline to get leaderboard data
    let sortStage = {};
    switch (sort) {
      case "badges":
        // Sort by badge count
        sortStage = { badgeCount: -1, "progress.totalPoints": -1 };
        break;
      case "challenges":
        // Sort by completed challenges
        sortStage = {
          completedChallengesCount: -1,
          "progress.totalPoints": -1,
        };
        break;
      case "points":
      default:
        // Sort by total points (default)
        sortStage = { "progress.totalPoints": -1, badgeCount: -1 };
        break;
    }

    const leaderboardData = await UserModel.aggregate([
      // Project required fields and counts
      {
        $project: {
          _id: 1,
          username: 1,
          githubId: 1,
          avatarUrl: 1,
          "progress.totalPoints": 1,
          "progress.streak": 1,
          completedChallengesCount: {
            $size: { $ifNull: ["$completedChallenges", []] },
          },
          badgeCount: { $size: { $ifNull: ["$badges", []] } },
          lastLogin: 1,
        },
      },
      // Sort by the selected criteria
      { $sort: sortStage },
      // Paginate
      { $skip: skip },
      { $limit: limit },
      // Remove sensitive information
      {
        $project: {
          _id: 1,
          username: 1,
          avatarUrl: 1,
          totalPoints: "$progress.totalPoints",
          currentStreak: "$progress.streak.current",
          completedChallengesCount: 1,
          badgeCount: 1,
          lastActive: "$lastLogin",
        },
      },
    ]);

    // Get total count of users for pagination
    const totalUsers = await UserModel.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch the top badges to display as achievements
    const topBadges = await BadgeModel.find().limit(5).lean();

    res.json({
      leaderboard: leaderboardData,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
      },
      topBadges,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
