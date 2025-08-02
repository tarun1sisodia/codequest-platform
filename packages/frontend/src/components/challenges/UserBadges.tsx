import React, { useEffect, useState } from "react";
import { getUserBadges } from "../../api/challenges";
import { Badge as BadgeType } from "../../types";
import { AchievementBadge } from "../ui/Badge";
import ErrorHandler, { APIError } from "../ui/ErrorHandler";

const UserBadges: React.FC = () => {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);
  const [animate, setAnimate] = useState(false);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const userBadges = await getUserBadges();
      setBadges(userBadges);
    } catch (err: any) {
      console.error("Error fetching badges:", err);
      // Extract error information from the response if available
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError({
          error: "Failed to load dashboard statistics",
          message: err.message || "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Animate in elements after a short delay
    setTimeout(() => {
      setAnimate(true);
    }, 100);

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-4 pb-16">
      {/* Show error handler if there's an error */}
      <ErrorHandler
        error={error}
        onRetry={fetchBadges}
        onClose={() => setError(null)}
      />

      <div className="container mx-auto max-w-6xl">
        {/* Hero section */}
        <div
          className={`mb-8 transition-all duration-700 ease-out transform ${
            animate ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-900/20">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Your Achievement Hall
            </h1>
            <p className="text-gray-400 mt-1">
              Badges earned through your coding quests
            </p>
          </div>
        </div>

        {/* Display badges */}
        {badges.length === 0 ? (
          <div
            className={`transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-200"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-lg p-10 border border-gray-700 text-center">
              <div className="w-24 h-24 mx-auto mb-6 opacity-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-600"
                >
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-400">
                No Badges Yet
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Complete all challenges in a concept category to earn your first
                achievement badge!
              </p>
              <a
                href="/learning"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-900/30 inline-block"
              >
                Begin Your Quest
              </a>
            </div>
          </div>
        ) : (
          <div
            className={`transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-200"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30 shadow-md">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {badges.map((badge) => (
                  <div
                    key={badge.conceptTag}
                    className="transform transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-gray-900/75 rounded-xl overflow-hidden border border-purple-500/20 p-4 flex flex-col items-center text-center hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-900/20 transition-all">
                      <AchievementBadge
                        imageSrc={badge.icon}
                        title={badge.name}
                        size="md"
                      >
                        <div className="mt-2 text-xs text-gray-400">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </div>
                      </AchievementBadge>

                      <p className="mt-3 text-sm text-gray-300">
                        {badge.description}
                      </p>

                      {/* Special effects for rare badges */}
                      {badge.conceptTag === "recursion" && (
                        <div className="mt-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full border border-purple-400">
                          Legendary
                        </div>
                      )}
                      {badge.conceptTag === "higher-order-functions" && (
                        <div className="mt-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs rounded-full border border-amber-400">
                          Epic
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats section when badges are present */}
        {badges.length > 0 && (
          <div
            className={`mt-8 transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-400"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30 shadow-md">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <span className="text-purple-400 mr-2">📊</span>
                Achievement Statistics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-sm text-gray-400 mb-1">Badges Earned</h3>
                  <p className="text-2xl font-bold text-white">
                    {badges.length}
                  </p>
                  <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{
                        width: `${Math.min((badges.length / 10) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {badges.length < 10
                      ? `${10 - badges.length} more badges until next level`
                      : "Maximum level reached!"}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-sm text-gray-400 mb-1">
                    Last Achievement
                  </h3>
                  <p className="text-xl font-bold text-white">
                    {badges.length > 0
                      ? badges.sort(
                          (a, b) =>
                            new Date(b.earnedAt).getTime() -
                            new Date(a.earnedAt).getTime()
                        )[0].name
                      : "None"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {badges.length > 0
                      ? new Date(
                          badges.sort(
                            (a, b) =>
                              new Date(b.earnedAt).getTime() -
                              new Date(a.earnedAt).getTime()
                          )[0].earnedAt
                        ).toLocaleDateString()
                      : ""}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
                  <h3 className="text-sm text-gray-400 mb-1">
                    Achievement Ranking
                  </h3>
                  <p className="text-xl font-bold text-white">
                    {badges.length >= 10
                      ? "Legendary"
                      : badges.length >= 7
                      ? "Master"
                      : badges.length >= 5
                      ? "Adept"
                      : badges.length >= 3
                      ? "Explorer"
                      : "Novice"}
                  </p>
                  <div className="mt-2">
                    <div className="inline-block px-2 py-1 rounded-full text-xs bg-gradient-to-r from-green-600 to-green-400 text-white">
                      {badges.length} / 10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locked badges section (for future achievements) */}
        {badges.length > 0 && (
          <div
            className={`mt-8 transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-600"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30 shadow-md">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <span className="text-gray-400 mr-2">🔒</span>
                Locked Achievements
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {["objects", "arrays", "async", "classes"]
                  .filter(
                    (tag) => !badges.some((badge) => badge.conceptTag === tag)
                  )
                  .map((conceptTag) => (
                    <div
                      key={conceptTag}
                      className="bg-gray-900/75 rounded-xl overflow-hidden border border-gray-700 p-4 flex flex-col items-center text-center"
                    >
                      <div className="w-24 h-24 relative mb-2 opacity-40 grayscale">
                        <img
                          src={`/badges/${conceptTag}.svg`}
                          alt={`${conceptTag} badge`}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl">🔒</span>
                        </div>
                      </div>

                      <h3 className="font-semibold text-base mb-1 text-gray-400">
                        {conceptTag.charAt(0).toUpperCase() +
                          conceptTag.slice(1)}{" "}
                        Master
                      </h3>
                      <p className="text-sm text-gray-500">
                        Complete all {conceptTag} challenges to unlock
                      </p>

                      <a
                        href={`/concept/${conceptTag}`}
                        className="mt-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
                      >
                        View Challenges
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBadges;
