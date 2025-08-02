// frontend/src/api/ai.ts
import { api } from "./config";

interface AIAssistanceRequest {
  code: string;
  challengeSlug: string; // Changed from challengeId to challengeSlug
  helpLevel: number;
  functionName?: string;
  testCases?: any[];
}

interface AIAssistanceResponse {
  suggestion: string;
}

/**
 * Get AI assistance for a coding challenge
 * @param request The AI assistance request parameters
 * @returns A promise resolving to the AI assistance response
 */
export const getAIAssistance = async (
  request: AIAssistanceRequest
): Promise<AIAssistanceResponse> => {
  try {
    const response = await api.post("/api/ai-assistance", request);
    return response.data;
  } catch (error) {
    console.error("Error getting AI assistance:", error);
    throw new Error("Failed to get AI assistance");
  }
};

/**
 * Get user's AI assistance usage statistics
 * @returns A promise resolving to the user's AI assistance usage
 */
export const getAIAssistanceUsage = async (): Promise<any> => {
  try {
    const response = await api.get("/api/ai-assistance/usage");
    return response.data;
  } catch (error) {
    console.error("Error getting AI assistance usage:", error);
    throw new Error("Failed to get AI assistance usage");
  }
};
