import { Router, Request } from "express";
import { z } from "zod";
import { CodeExecutor } from "../services/executor";
import { ChallengeModel } from "../models/Challenge";
import { UserModel } from "../models/User";
import { SubmissionModel } from "../models/Submission";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { CertificateModel } from "../models/Certificate";

const router = Router();
const executor = new CodeExecutor();

async function checkLanguageCertificateEligibility(
  userId: string,
  language: string
) {
  try {
    // Check if certificate already exists
    const existingCertificate = await CertificateModel.findOne({
      userId,
      language,
    });

    if (existingCertificate) {
      return { certificateExists: true, certificate: existingCertificate };
    }

    // Get all challenges for this language
    const allChallenges = await ChallengeModel.find({ language }).lean();

    if (allChallenges.length === 0) {
      return { eligible: false, reason: "No challenges found" };
    }

    // Get user's completed challenges
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return { eligible: false, reason: "User not found" };
    }

    const completedChallenges = user.completedChallenges || [];

    // Check if all challenges are completed
    const allCompleted = allChallenges.every((challenge) =>
      completedChallenges.includes(challenge.slug)
    );

    if (allCompleted) {
      // Create a new certificate
      const newCertificate = await CertificateModel.create({
        userId,
        language,
        earnedAt: new Date(),
        challenges: allChallenges.map((challenge) => challenge._id),
      });

      return {
        eligible: true,
        certificateAwarded: true,
        certificate: newCertificate,
      };
    }

    return {
      eligible: false,
      progress: {
        completed: completedChallenges.length,
        total: allChallenges.length,
        percentage: Math.round(
          (completedChallenges.length / allChallenges.length) * 100
        ),
      },
    };
  } catch (error) {
    console.error("Error checking certificate eligibility:", error);
    return { eligible: false, error: "Internal error" };
  }
}

// Validation schema for submissions
const SubmissionSchema = z.object({
  challengeSlug: z.string(), // Changed from challengeId to challengeSlug
  code: z.string(),
  language: z.enum(["javascript", "typescript", "php", "go"]), // Added PHP and Go as acceptable languages
});

router.post("/", authMiddleware, async (req: Request, res) => {
  try {
    // Cast req to AuthRequest to access user property
    const authReq = req as AuthRequest;
    const user = authReq.user;

    const submission = SubmissionSchema.parse(req.body);

    // Validate code length (10KB limit)
    if (submission.code.length > 10000) {
      return res.status(400).json({ error: "Code too long. Maximum 10KB allowed." });
    }

    // Fetch the challenge by slug
    const challenge = await ChallengeModel.findOne({ slug: submission.challengeSlug });
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Validate that the submission language matches the challenge language
    if (challenge.language !== submission.language) {
      return res.status(400).json({ 
        error: `Language mismatch. Challenge expects ${challenge.language}, but received ${submission.language}` 
      });
    }

    // Execute code and get results
    const metadata = {
      functionName: challenge.functionName,
      parameterTypes: challenge.parameterTypes,
      returnType: challenge.returnType,
    };

    // Pass language to executeCode method to determine which executor to use
    const results = await executor.executeCode(
      submission.code,
      challenge.testCases,
      metadata,
      submission.language
    );

    // Create submission record in database
    const submissionRecord = await SubmissionModel.create({
      userId: user._id,
      challengeSlug: challenge.slug,
      code: submission.code,
      language: submission.language,
      status: results.success ? "passed" : "failed",
      results: results.results,
      metrics: results.metrics,
    });

    // Also update user's submissions array for backwards compatibility
    const userSubmissionRecord = {
      challengeSlug: challenge.slug,
      timestamp: new Date(),
      status: results.success ? "passed" : "failed",
      language: submission.language,
      code: submission.code,
      results: results.results,
    };

    // Update user document
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $push: { submissions: userSubmissionRecord },
        // If passed, add to completed challenges if not already there
        ...(results.success && {
          $addToSet: { completedChallenges: challenge.slug },
        }),
      },
      { new: true }
    );

    console.log("Submission recorded for user:", user._id);

    // If submission is successful, update concept progress
    if (results.success) {
      const challenge = await ChallengeModel.findOne({ slug: submission.challengeSlug });

      if (challenge && challenge.conceptTags?.length) {
        // Get current date
        const completionDate = new Date();

        // Prepare updates - use proper MongoDB update operators with type-safe paths
        const incrementUpdates: Record<string, number> = {}; // For numeric fields
        const setUpdates: Record<string, any> = {}; // For non-numeric fields like dates

        // Update user progress for each concept
        for (const conceptTag of challenge.conceptTags) {
          // Use proper MongoDB dot notation for paths
          incrementUpdates[
            `progress.conceptsProgress.${conceptTag}.completed`
          ] = 1;
          setUpdates[`progress.conceptsProgress.${conceptTag}.lastCompleted`] =
            completionDate;
        }

        // Update language progress
        incrementUpdates[
          `progress.languageProgress.${challenge.language}.completed`
        ] = 1;
        setUpdates[
          `progress.languageProgress.${challenge.language}.lastCompleted`
        ] = completionDate;

        // Update points
        incrementUpdates["progress.totalPoints"] = challenge.points || 10;

        // Fetch full user document to access progress data
        const user = await UserModel.findById(authReq.user._id).lean();
        if (!user) {
          throw new Error("User not found");
        }

        // Calculate streak
        const lastActive = user.progress?.streak?.lastActive;
        const now = new Date();
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Update streak fields
        if (lastActive && lastActive > oneDayAgo) {
          // Continue streak - increment current streak
          incrementUpdates["progress.streak.current"] = 1;
          setUpdates["progress.streak.lastActive"] = now;

          // Update longest streak if needed
          const currentStreak = (user.progress?.streak?.current || 0) + 1;
          const longestStreak = user.progress?.streak?.longest || 0;
          if (currentStreak > longestStreak) {
            incrementUpdates["progress.streak.longest"] = 1;
          }
        } else {
          // Reset streak
          setUpdates["progress.streak.current"] = 1;
          setUpdates["progress.streak.lastActive"] = now;
        }

        // Perform updates using both $inc and $set
        const updateOperation = {
          $inc: incrementUpdates,
          $set: setUpdates,
          $addToSet: { completedChallenges: challenge.slug },
        };

        // Update user document
        await UserModel.findByIdAndUpdate(authReq.user._id, updateOperation);
      }
    }
    // Get the language from the challenge
    const certificateCheck = await checkLanguageCertificateEligibility(
      user._id.toString(),
      challenge.language
    );

    // Prepare response
    const response: any = {
      submission: submissionRecord,
      results: results,
      success: results.success,
      metrics: results.metrics,
    };

    // Add certificate information to the response if a certificate was awarded
    if (certificateCheck.certificateAwarded) {
      response.certificateAwarded = true;
      response.certificate = certificateCheck.certificate;
    }

    res.json(response);
  } catch (error) {
    console.error("Submission error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("timeout") || errorMessage.includes("Execution timeout")) {
        res.status(500).json({
          error: "Execution failed due to timeout",
          details: errorMessage,
        });
      } else {
        res.status(500).json({
          error: "Submission failed",
          details: errorMessage,
        });
      }
    }
  }
});

// Get user's submissions with pagination and filtering
router.get("/", authMiddleware, async (req: Request, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user._id;

    // Build filter
    const filter: any = { userId };
    
    if (req.query.challengeSlug) {
      filter.challengeSlug = req.query.challengeSlug;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const submissions = await SubmissionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalSubmissions = await SubmissionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalSubmissions / limit);

    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total: totalSubmissions, // Use 'total' instead of 'totalSubmissions' to match test expectations
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      error: "Failed to fetch submissions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get single submission by ID
router.get("/:id", authMiddleware, async (req: Request, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user._id;
    const submissionId = req.params.id;

    // Validate ObjectId format
    if (!submissionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid submission ID format" });
    }

    const submission = await SubmissionModel.findOne({
      _id: submissionId,
      userId, // Ensure user can only access their own submissions
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({ submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({
      error: "Failed to fetch submission",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
