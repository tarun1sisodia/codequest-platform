// backend/src/routes/aiAssistance.ts
import { Router, Request, Response } from "express";
import { AIAssistanceService } from "../services/aiAssistance";
import { ChallengeModel } from "../models/Challenge";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const aiAssistanceService = new AIAssistanceService();

// POST /api/ai-assistance - Get AI assistance for a coding challenge
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { challengeSlug, code, helpLevel, functionName, testCases } = req.body;

    // Validate required fields
    if (!challengeSlug || !code || helpLevel === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get the challenge from the database
    const challenge = await ChallengeModel.findOne({ slug: challengeSlug });
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Get AI assistance
    const assistance = await aiAssistanceService.getAssistance(challenge, {
      code,
      challengeSlug,
      helpLevel,
      functionName,
      testCases,
    });

    // Track user's assistance requests (optional)
    const authReq = req as AuthRequest;
    if (authReq.user) {
      // You could record assistance usage here for analytics or rate limiting
      // Example: update user document with timestamp and help level requested
    }

    res.json(assistance);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI assistance error:", error);
    res.status(500).json({
      error: "Failed to get AI assistance",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/ai-assistance/usage - Get user's AI assistance usage (optional)
router.get("/usage", authMiddleware, async (req: Request, res: Response) => {
  try {
    // Future implementation: access user via req as AuthRequest
    // You could implement logic to return the user's usage statistics
    // For example: how many times they've requested help, at what levels, etc.

    res.json({
      message: "AI assistance usage endpoint",
      // Add actual usage data here when implemented
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching AI assistance usage:", error);
    res.status(500).json({ error: "Failed to fetch AI assistance usage" });
  }
});

export default router;
