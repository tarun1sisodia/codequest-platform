import { api } from "./config";

export interface LeaderboardUser {
  _id: string;
  username: string;
  avatarUrl?: string;
  totalPoints: number;
  currentStreak: number;
  completedChallengesCount: number;
  badgeCount: number;
  lastActive: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  pagination: Pagination;
  topBadges: any[];
}

export interface LeaderboardParams {
  limit?: number;
  page?: number;
  sort?: "points" | "badges" | "challenges";
}

/**
 * Fetch leaderboard data
 */
export const getLeaderboard = async (
  params: LeaderboardParams = {}
): Promise<LeaderboardResponse> => {
  const { limit = 10, page = 1, sort = "points" } = params;

  const response = await api.get("/api/leaderboard", {
    params: { limit, page, sort },
  });

  return response.data;
};
