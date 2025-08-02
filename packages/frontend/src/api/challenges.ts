import { api } from "./config";
import { Challenge, SubmissionResult, ConceptProgress, Badge } from "../types";

export const getChallenges = async (): Promise<Challenge[]> => {
  const response = await api.get("/api/challenges");
  return response.data.challenges || response.data;
};

export const getChallenge = async (identifier: string): Promise<Challenge> => {
  const response = await api.get(`/api/challenges/${identifier}`);
  return response.data.challenge || response.data;
};

export const submitSolution = async (
  challengeSlug: string,
  code: string,
  language: "javascript" | "typescript" | "php" | "go"
): Promise<SubmissionResult> => {
  const response = await api.post("/api/submissions", {
    challengeSlug,
    code,
    language,
  });
  return response.data;
};

// Get the progress for a specific concept
export const getChallengeProgress = async (
  conceptTag: string
): Promise<ConceptProgress> => {
  const response = await api.get("/api/user/progress", {
    params: { conceptTag },
  });
  return response.data;
};

// Get the next challenge in a sequence
export const getNextChallenge = async (
  conceptTag: string,
  currentSlug: string
): Promise<Challenge | null> => {
  try {
    console.log("Calling getNextChallenge with:", { conceptTag, currentSlug });
    const response = await api.get("/api/challenges/next", {
      params: {
        conceptTag,
        currentSlug,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getNextChallenge:", error);
    throw error;
  }
};

export const getAllChallengesByConceptTag = async (
  conceptTag: string
): Promise<Challenge[]> => {
  try {
    // Get all challenges first
    const response = await api.get("/api/challenges");
    const allChallenges = response.data.challenges || response.data;

    // Filter by concept tag on the client side
    return allChallenges.filter(
      (challenge: Challenge) =>
        challenge.conceptTags && challenge.conceptTags.includes(conceptTag)
    );
  } catch (error) {
    console.error("Error fetching challenges by concept tag:", error);
    throw error;
  }
};

// Award a badge for completing all challenges in a concept
export const earnBadge = async (
  conceptTag: string
): Promise<{ message: string; badge: Badge }> => {
  const response = await api.post("/api/user/badges", { conceptTag });
  return response.data;
};

// Get all earned badges
export const getUserBadges = async (): Promise<Badge[]> => {
  const response = await api.get("/api/user/badges");
  return response.data;
};
