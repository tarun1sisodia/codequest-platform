import { api } from "./config";

export interface Tutorial {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  language: string;
  order: number;
  timeToComplete: number;
  mainImage?: string;
  author: string;
  steps?: any[];
  relatedConcepts?: any[];
}

export const getTutorials = async (params?: {
  category?: string;
  language?: string;
} | undefined): Promise<Tutorial[]> => {
  // Initialize params if not provided
  params = params || {};
  try {
    console.log('Calling API with params:', params);
    const response = await api.get("/api/tutorials", { params });
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getTutorials:', error);
    throw error;
  }
};

export const getTutorialBySlug = async (slug: string): Promise<Tutorial> => {
  const response = await api.get(`/api/tutorials/${slug}`);
  return response.data;
};

export const updateTutorialProgress = async (
  tutorialId: string,
  stepIndex: number,
  completed: boolean
): Promise<{ message: string }> => {
  const response = await api.post(`/api/tutorials/${tutorialId}/progress`, {
    stepIndex,
    completed,
  });
  return response.data;
};