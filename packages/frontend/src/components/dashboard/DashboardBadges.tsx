import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserBadges } from "../../api/challenges";
import { Badge as BadgeType } from "../../types";

const DashboardBadges: React.FC = () => {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userBadges = await getUserBadges();
        setBadges(userBadges);
      } catch (err) {
        console.error("Error fetching badges:", err);
        setError("Failed to load badges");
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20 shadow-md">
        <div className="h-32 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-700"></div>
            <div className="w-12 h-12 rounded-full bg-gray-700"></div>
            <div className="w-12 h-12 rounded-full bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20 shadow-md">
        <div className="text-red-400 text-center p-4">
          <div className="text-2xl mb-2">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Sort badges by earned date (newest first)
  const sortedBadges = [...badges].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );

  // Take only the 5 most recent badges
  const recentBadges = sortedBadges.slice(0, 5);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="text-yellow-500 mr-2">🏆</span>
          Achievements
        </h2>
        <Link
          to="/profile/badges"
          className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center"
        >
          View All
          <span className="ml-1">→</span>
        </Link>
      </div>

      {badges.length === 0 ? (
        <div className="py-4 text-center">
          <div className="w-16 h-16 mx-auto mb-3 opacity-40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-500"
            >
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">No badges earned yet</p>
          <Link
            to="/learning"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Complete challenges to earn badges
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap justify-center gap-4 pb-3">
            {recentBadges.map((badge) => (
              <div
                key={badge.conceptTag}
                className="transform transition-all duration-300 hover:scale-110 group"
              >
                <Link to="/profile/badges" className="block">
                  <div className="relative">
                    {/* Badge glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300"></div>

                    {/* Badge image */}
                    <div className="relative z-10 w-14 h-14">
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="mt-1 text-center">
                    <p className="text-xs text-gray-300 font-medium truncate w-16 mx-auto">
                      {badge.name.replace(" Master", "")}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Show earned vs total badges */}
          <div className="mt-2 pt-3 border-t border-gray-700">
            <div className="text-sm text-gray-400 flex justify-between items-center">
              <span>Progress</span>
              <span className="text-white font-medium">{badges.length}/10</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{
                  width: `${Math.min((badges.length / 10) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-500 text-right">
              {badges.length >= 10
                ? "Maxed out!"
                : `${10 - badges.length} more to reach Legend status`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBadges;
