import React, { useEffect, useState, useCallback } from "react";
import {
  getLeaderboard,
  LeaderboardUser,
  Pagination,
} from "../../api/leaderboard";
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type SortOption = "points" | "badges" | "challenges";

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [topBadges, setTopBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("points");
  const [currentPage, setCurrentPage] = useState(1);
  const [animate, setAnimate] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkMobile();

    // Add window resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard({
        sort: sortBy,
        page: currentPage,
        limit: 10,
      });

      setLeaderboard(data.leaderboard);
      setPagination(data.pagination);
      setTopBadges(data.topBadges);
      setError(null);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [sortBy, currentPage]);

  useEffect(() => {
    // Animate in elements after a short delay
    setTimeout(() => {
      setAnimate(true);
    }, 100);

    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Format date to relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)}mo ago`;

    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  // Generate random ranks/titles based on points
  const getRankTitle = (points: number) => {
    if (points >= 1000) return "Grandmaster";
    if (points >= 750) return "Master";
    if (points >= 500) return "Expert";
    if (points >= 250) return "Adept";
    if (points >= 100) return "Apprentice";
    return "Novice";
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading leaderboard data...</p>
        </div>
      </div>
    );
  }

  if (error && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
        <div className="max-w-lg mx-auto bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => fetchLeaderboard()}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mobile Optimized Leaderboard
  const renderMobileLeaderboard = () => {
    return (
      <div className="divide-y divide-gray-700/50">
        {leaderboard.map((user, index) => {
          // Calculate position based on pagination
          const position =
            ((pagination?.currentPage || 1) - 1) * (pagination?.limit || 10) +
            index +
            1;

          // Determine medal emoji for top 3
          let medalEmoji = "";
          if (position === 1) medalEmoji = "🥇";
          else if (position === 2) medalEmoji = "🥈";
          else if (position === 3) medalEmoji = "🥉";

          // Define background color based on position
          let bgClass = "";
          if (position === 1) bgClass = "bg-yellow-900/20";
          else if (position === 2) bgClass = "bg-gray-700/20";
          else if (position === 3) bgClass = "bg-amber-800/20";

          return (
            <div key={user._id} className={`p-4 ${bgClass}`}>
              {/* Top row with position, name and badge count */}
              <div className="flex items-center mb-2">
                <div className="flex items-center flex-1">
                  <div className="w-7 h-7 flex items-center justify-center mr-2">
                    {medalEmoji || (
                      <span className="font-bold">{position}</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border-2 border-purple-500/50 bg-gray-700 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="font-medium text-white">{user.username}</div>
                </div>

                <div>
                  <span
                    className={`
                    px-2 py-1 rounded-full text-xs font-medium inline-block
                    ${
                      user.totalPoints >= 1000
                        ? "bg-purple-900/50 text-purple-300 border border-purple-500/50"
                        : user.totalPoints >= 500
                        ? "bg-blue-900/50 text-blue-300 border border-blue-500/50"
                        : "bg-green-900/50 text-green-300 border border-green-500/50"
                    }
                  `}
                  >
                    {getRankTitle(user.totalPoints)}
                  </span>
                </div>
              </div>

              {/* Bottom row with stats */}
              <div className="grid grid-cols-4 gap-2 mt-2 text-center text-sm">
                <div>
                  <div className="text-xs text-gray-400">Points</div>
                  <div className="font-mono font-bold text-yellow-400">
                    {user.totalPoints || 0}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Badges</div>
                  <div className="flex items-center justify-center">
                    <TrophyIcon className="w-3 h-3 text-yellow-500 mr-1" />
                    <span>{user.badgeCount}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Quests</div>
                  <div className="flex items-center justify-center">
                    <StarIcon className="w-3 h-3 text-blue-400 mr-1" />
                    <span>{user.completedChallengesCount}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Streak</div>
                  <div className="flex items-center justify-center">
                    <FireIcon className="w-3 h-3 text-orange-500 mr-1" />
                    <span>{user.currentStreak || 0}</span>
                  </div>
                </div>
              </div>

              {/* Last active indicator */}
              <div className="mt-2 text-right">
                <span className="text-xs text-gray-400">
                  {user.lastActive ? getRelativeTime(user.lastActive) : "N/A"}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading state */}
        {loading && (
          <div className="bg-gray-800/50 p-4 flex justify-center items-center">
            <ArrowPathIcon className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="ml-2 text-purple-400">Updating...</span>
          </div>
        )}

        {/* Empty state */}
        {leaderboard.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <p className="text-gray-400 mb-2">No adventurers found</p>
            <p className="text-sm text-gray-500">
              Be the first to join the quest!
            </p>
          </div>
        )}
      </div>
    );
  };

  // Desktop Leaderboard
  const renderDesktopLeaderboard = () => {
    return (
      <div className="divide-y divide-gray-700/50">
        {leaderboard.map((user, index) => {
          // Calculate position based on pagination
          const position =
            ((pagination?.currentPage || 1) - 1) * (pagination?.limit || 10) +
            index +
            1;

          // Determine highlight styles for top 3
          let highlightClass = "";
          let medalEmoji = "";

          if (position === 1) {
            highlightClass = "bg-yellow-900/20 hover:bg-yellow-900/30";
            medalEmoji = "🥇";
          } else if (position === 2) {
            highlightClass = "bg-gray-700/20 hover:bg-gray-700/30";
            medalEmoji = "🥈";
          } else if (position === 3) {
            highlightClass = "bg-amber-800/20 hover:bg-amber-800/30";
            medalEmoji = "🥉";
          } else {
            highlightClass = "hover:bg-gray-700/30";
          }

          return (
            <div
              key={user._id}
              className={`p-4 ${highlightClass} transition-colors`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Position */}
                <div className="col-span-1 text-center">
                  {medalEmoji || position}
                </div>

                {/* User */}
                <div className="col-span-4 flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-purple-500/50 bg-gray-700 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      User ID: {user._id.substring(0, 8)}...
                    </div>
                  </div>
                </div>

                {/* Rank */}
                <div className="col-span-2 text-center">
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${
                      user.totalPoints >= 1000
                        ? "bg-purple-900/50 text-purple-300 border border-purple-500/50"
                        : user.totalPoints >= 500
                        ? "bg-blue-900/50 text-blue-300 border border-blue-500/50"
                        : "bg-green-900/50 text-green-300 border border-green-500/50"
                    }
                  `}
                  >
                    {getRankTitle(user.totalPoints)}
                  </span>
                </div>

                {/* Points */}
                <div className="col-span-1 text-center font-mono font-bold text-yellow-400">
                  {user.totalPoints?.toLocaleString() || 0}
                </div>

                {/* Badges */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center">
                    <TrophyIcon className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{user.badgeCount}</span>
                  </div>
                </div>

                {/* Challenges */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center">
                    <StarIcon className="w-4 h-4 text-blue-400 mr-1" />
                    <span>{user.completedChallengesCount}</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center">
                    <FireIcon className="w-4 h-4 text-orange-500 mr-1" />
                    <span>{user.currentStreak || 0}</span>
                  </div>
                </div>

                {/* Last Active */}
                <div className="col-span-1 text-center text-xs text-gray-400">
                  {user.lastActive ? getRelativeTime(user.lastActive) : "N/A"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 px-4 pb-16">
      <div className="container mx-auto max-w-6xl">
        {/* Hero section */}
        <div
          className={`mb-8 transition-all duration-700 ease-out transform ${
            animate ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-purple-500/30 shadow-lg shadow-purple-900/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Leaderboard
                </h1>
                <p className="text-gray-400 mt-1">
                  The most accomplished CodeQuest adventurers
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-1 flex shadow-inner border border-gray-700 w-full sm:w-auto">
                <button
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm transition-all ${
                    sortBy === "points"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => handleSortChange("points")}
                >
                  By Points
                </button>
                <button
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm transition-all ${
                    sortBy === "badges"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => handleSortChange("badges")}
                >
                  By Badges
                </button>
                <button
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm transition-all ${
                    sortBy === "challenges"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => handleSortChange("challenges")}
                >
                  By Challenges
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div
          className={`mb-8 transition-all duration-700 ease-out transform ${
            animate
              ? "translate-y-0 opacity-100 delay-200"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-purple-500/30 shadow-lg shadow-purple-900/20">
            {/* Header - Only show on desktop */}
            {!isMobile && (
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 hidden md:block">
                <div className="grid grid-cols-12 gap-4 text-gray-300 text-sm font-medium">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-4">Adventurer</div>
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-1 text-center">Points</div>
                  <div className="col-span-1 text-center">Badges</div>
                  <div className="col-span-1 text-center">Quests</div>
                  <div className="col-span-1 text-center">Streak</div>
                  <div className="col-span-1 text-center">Last Active</div>
                </div>
              </div>
            )}

            {/* Mobile header equivalent */}
            {isMobile && (
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-3">
                <div className="grid grid-cols-4 gap-2 text-xs text-center text-gray-300 font-medium">
                  <div className="col-span-4">Adventurer / Rank</div>
                  <div>Points</div>
                  <div>Badges</div>
                  <div>Quests</div>
                  <div>Streak</div>
                </div>
              </div>
            )}

            {/* Table Body - Conditional rendering based on device */}
            {isMobile ? renderMobileLeaderboard() : renderDesktopLeaderboard()}

            {/* Pagination - Simplified for mobile */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center">
                {!isMobile && (
                  <div className="text-sm text-gray-400">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalUsers
                    )}{" "}
                    of {pagination.totalUsers} adventurers
                  </div>
                )}

                <div
                  className={`flex space-x-2 ${
                    isMobile ? "w-full justify-center" : ""
                  }`}
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`p-2 rounded-lg ${
                      pagination.currentPage === 1
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  {/* Page indicators - Show fewer on mobile */}
                  <div className="flex space-x-1">
                    {Array.from(
                      {
                        length: isMobile
                          ? Math.min(3, pagination.totalPages)
                          : Math.min(5, pagination.totalPages),
                      },
                      (_, i) => {
                        // Create a window of pages centered on current page
                        let pageNum: number;
                        const maxVisible = isMobile ? 3 : 5;

                        if (pagination.totalPages <= maxVisible) {
                          pageNum = i + 1;
                        } else if (
                          pagination.currentPage <= Math.ceil(maxVisible / 2)
                        ) {
                          pageNum = i + 1;
                        } else if (
                          pagination.currentPage >=
                          pagination.totalPages - Math.floor(maxVisible / 2)
                        ) {
                          pageNum =
                            pagination.totalPages - (maxVisible - 1) + i;
                        } else {
                          pageNum =
                            pagination.currentPage -
                            Math.floor(maxVisible / 2) +
                            i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-md ${
                              pagination.currentPage === pageNum
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium"
                                : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`p-2 rounded-lg ${
                      pagination.currentPage === pagination.totalPages
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Achievements section - Simplified for mobile */}
        {topBadges && topBadges.length > 0 && (
          <div
            className={`mb-8 transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-400"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-purple-500/30 shadow-lg shadow-purple-900/20">
              <h2 className="text-xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Legendary Achievements
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
                {topBadges.map((badge) => (
                  <div
                    key={badge._id}
                    className="bg-gray-900/75 rounded-xl overflow-hidden border border-purple-500/20 p-3 sm:p-4 flex flex-col items-center text-center hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-900/20 transition-all"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 relative mb-2">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-50 blur-sm"></div>
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="w-full h-full object-contain relative z-10"
                      />
                    </div>

                    <h3 className="font-semibold text-sm sm:text-base mb-1 text-white">
                      {badge.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Join the Quest CTA - Made responsive */}
        <div
          className={`transition-all duration-700 ease-out transform ${
            animate
              ? "translate-y-0 opacity-100 delay-600"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 sm:p-8 border border-purple-500/30 shadow-lg shadow-purple-900/20 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Ready to Join the Ranks?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto">
              Begin your coding adventure today and climb the leaderboard.
              Complete challenges, earn badges, and become a legendary coder.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a
                href="/challenges"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-900/30"
              >
                Start Your Quest
              </a>
              <a
                href="/learning"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 rounded-lg text-gray-300 font-bold hover:bg-gray-700 hover:text-white transform hover:scale-105 transition-all duration-200 border border-purple-500/30"
              >
                View Skill Tree
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
