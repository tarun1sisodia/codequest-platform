import { api } from "./config";
import { Certificate } from "../types";

export const getUserCertificates = async (): Promise<Certificate[]> => {
  const response = await api.get("/api/user/certificates");
  return response.data;
};

export const getCertificateDetails = async (
  id: string
): Promise<Certificate> => {
  const response = await api.get(`/api/user/certificates/${id}`);
  return response.data;
};

export const checkCertificateEligibility = async (
  language: string
): Promise<any> => {
  try {
    const response = await api.post("/api/user/certificates", { language });
    return {
      success: true,
      ...response.data,
    };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return {
        success: false,
        ...error.response.data,
      };
    }
    throw error;
  }
};
