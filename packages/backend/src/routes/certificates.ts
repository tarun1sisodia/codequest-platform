import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ChallengeModel } from "../models/Challenge";
import { CertificateModel } from "../models/Certificate";

const router = Router();

// Get all certificates for the logged-in user
router.get(
  "/user/certificates",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      // Find all certificates for the user
      const certificates = await CertificateModel.find({ userId }).lean();

      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({
        error: "Failed to fetch certificates",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Check eligibility and award a language certificate
router.post(
  "/user/certificates",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { language } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      if (!language) {
        return res.status(400).json({ error: "Language is required" });
      }

      // Check if certificate already exists for this language
      const existingCertificate = await CertificateModel.findOne({
        userId,
        language,
      });

      if (existingCertificate) {
        return res.json({
          message: "Certificate already earned",
          certificate: existingCertificate,
        });
      }

      // Get all challenges for the selected language
      const allChallenges = await ChallengeModel.find({ language }).lean();

      if (allChallenges.length === 0) {
        return res.status(404).json({
          error: "No challenges found for this language",
        });
      }

      // Get user's completed challenges
      const completedChallenges = authReq.user.completedChallenges || [];

      // Check if all challenges are completed
      const allCompleted = allChallenges.every((challenge) =>
        completedChallenges.some(
          (id) => id.toString() === challenge._id.toString()
        )
      );

      if (!allCompleted) {
        return res.status(400).json({
          error: "Not all challenges are completed for this language",
          completed: completedChallenges.length,
          total: allChallenges.length,
          progress: (completedChallenges.length / allChallenges.length) * 100,
        });
      }

      // Create the certificate
      const newCertificate = await CertificateModel.create({
        userId,
        language,
        earnedAt: new Date(),
        challenges: allChallenges.map((challenge) => challenge._id),
      });

      res.json({
        message: "Certificate awarded successfully",
        certificate: newCertificate,
      });
    } catch (error) {
      console.error("Error awarding certificate:", error);
      res.status(500).json({
        error: "Failed to award certificate",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get certificate details by ID
router.get(
  "/user/certificates/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      // Find certificate with populated challenges
      const certificate = await CertificateModel.findOne({
        _id: id,
        userId,
      }).populate("challenges", "title difficulty conceptTags");

      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      res.json(certificate);
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      res.status(500).json({
        error: "Failed to fetch certificate details",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
