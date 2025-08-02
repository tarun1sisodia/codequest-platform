import { api } from "./config";

export const getLearningPath = async (language = "typescript") => {
  const response = await api.get(`/api/learning/path?language=${language}`);
  return response.data;
};

export const getConceptDetails = async (slug: string) => {
  const response = await api.get(`/api/learning/concept/${slug}`);
  return response.data;
};
