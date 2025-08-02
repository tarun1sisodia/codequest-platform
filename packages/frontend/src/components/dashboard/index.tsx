import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardBadges from "./DashboardBadges";
import api from "../../api/config";
import {
  TrophyIcon,
  FireIcon,
  CodeBracketIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import ErrorHandler, { APIError } from "../ui/ErrorHandler";

interface DashboardStats {
  totalChallenges: number;
  completedChallenges: number;
  totalSubmissions: number;
  successRate: number;
  submissionsByLanguage: Record<string, number>;
  recentSubmissions: any[];
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<APIError | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Animate in elements after a short delay
    setTimeout(() => {
      setAnimate(true);
    }, 100);

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/dashboard/stats");
      setStats(response.data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading your quest data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
        <div className="max-w-lg mx-auto bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-300 mb-4">No data available</p>
          <Link
            to="/challenges"
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
          >
            Start a Challenge
          </Link>
        </div>
      </div>
    );
  }

  // Ensure stats has default values to prevent breaking when empty
  const safeStats = {
    ...stats,
    completedChallenges: stats.completedChallenges || 0,
    totalChallenges: stats.totalChallenges || 0,
    successRate: stats.successRate || 0,
    totalSubmissions: stats.totalSubmissions || 0,
    submissionsByLanguage: stats.submissionsByLanguage || {},
    recentSubmissions: stats.recentSubmissions || [],
  };

  // Calculate level based on completed challenges
  const level = Math.floor(safeStats.completedChallenges / 5) + 1;
  const xpForNextLevel = level * 5 - safeStats.completedChallenges;
  const levelProgress = ((safeStats.completedChallenges % 5) / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-4 pb-16">
      {/* Show error handler if there's an error */}
      <ErrorHandler
        error={error}
        onRetry={fetchDashboardData}
        onClose={() => setError(null)}
      />
      <div className="container mx-auto max-w-6xl">
        {/* Hero section with level and rank */}
        <div
          className={`mb-8 bg-gray-800 rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-900/20 transition-all duration-700 ease-out transform ${
            animate ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center">
              <div className="mr-6 relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                  {level}
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  <TrophyIcon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Adventurer's Dashboard
                </h1>
                <div className="mt-2">
                  <div className="text-sm text-gray-400 mb-1">
                    Level {level} Code Warrior
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      style={{ width: `${levelProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {xpForNextLevel} more{" "}
                    {xpForNextLevel === 1 ? "quest" : "quests"} to level{" "}
                    {level + 1}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/20">
                <div className="flex items-center">
                  <FireIcon className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="text-gray-400 text-sm">Current Streak</span>
                </div>
                <div className="text-2xl font-bold mt-1">7 Days</div>
              </div>

              <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/20">
                <div className="flex items-center">
                  <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-gray-400 text-sm">Rank</span>
                </div>
                <div className="text-2xl font-bold mt-1">Adept</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats overview */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-700 ease-out transform ${
            animate
              ? "translate-y-0 opacity-100 delay-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center mr-3">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-400 text-sm uppercase">
                Quests Completed
              </h3>
            </div>
            <p className="text-3xl font-bold">
              {safeStats.completedChallenges}/{safeStats.totalChallenges}
            </p>
            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-300"
                style={{
                  width: `${
                    (safeStats.completedChallenges /
                      Math.max(safeStats.totalChallenges, 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mr-3">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-400 text-sm uppercase">Success Rate</h3>
            </div>
            <p className="text-3xl font-bold">
              {safeStats.successRate.toFixed(1)}%
            </p>
            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-300"
                style={{ width: `${safeStats.successRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center mr-3">
                <CodeBracketIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-400 text-sm uppercase">
                Total Submissions
              </h3>
            </div>
            <p className="text-3xl font-bold">{safeStats.totalSubmissions}</p>
            <p className="mt-2 text-xs text-gray-500">
              {safeStats.totalSubmissions > 0 && safeStats.recentSubmissions[0]?.timestamp
                ? `Last submission: ${new Date(
                    safeStats.recentSubmissions[0].timestamp
                  ).toLocaleDateString()}`
                : "No submissions yet"}
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center mr-3">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-400 text-sm uppercase">
                Languages Used
              </h3>
            </div>
            <p className="text-3xl font-bold">
              {Object.keys(safeStats.submissionsByLanguage).length}
            </p>
            <div className="mt-2 flex gap-1">
              {Object.keys(safeStats.submissionsByLanguage).map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 text-xs rounded-full bg-pink-900/50 text-pink-300 border border-pink-500/30"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Badges and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Badges Section */}
          <div
            className={`lg:col-span-1 transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-200"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Your Badges
              </h2>
              <DashboardBadges />
            </div>
          </div>

          {/* Recent Submissions */}
          <div
            className={`lg:col-span-2 transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-300"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Recent Adventures
              </h2>

              {safeStats.recentSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400">Quest</th>
                        <th className="text-left py-2 text-gray-400">
                          Language
                        </th>
                        <th className="text-left py-2 text-gray-400">Status</th>
                        <th className="text-left py-2 text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeStats.recentSubmissions.map((submission, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-3">
                            <Link
                              to={`/challenge/${submission.challengeSlug}`}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {submission.challenge?.title || "Unknown Quest"}
                            </Link>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300 border border-gray-600">
                              {submission.language}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                submission.status === "passed"
                                  ? "bg-green-900/50 text-green-300 border border-green-500/50"
                                  : "bg-red-900/50 text-red-300 border border-red-500/50"
                              }`}
                            >
                              {submission.status === "passed"
                                ? "VICTORY"
                                : "DEFEATED"}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">
                            {submission.timestamp 
                              ? new Date(submission.timestamp).toLocaleDateString()
                              : "Unknown Date"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-700/30 rounded-lg p-8 text-center border border-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-500 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-gray-400 mb-4">
                    You haven't embarked on any quests yet!
                  </p>
                  <Link
                    to="/challenges"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    Find Your First Quest
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div
          className={`transition-all duration-700 ease-out transform ${
            animate
              ? "translate-y-0 opacity-100 delay-400"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-pink-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Skill Distribution
            </h2>

            {Object.keys(safeStats.submissionsByLanguage).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(safeStats.submissionsByLanguage).map(
                  ([lang, count]) => {
                    // Calculate percentage
                    const percentage = Math.round(
                      (count / safeStats.totalSubmissions) * 100
                    );

                    // Determine colors based on language
                    const colors =
                      lang === "typescript"
                        ? "from-blue-600 to-blue-400"
                        : lang === "javascript"
                        ? "from-yellow-600 to-yellow-400"
                        : "from-green-600 to-green-400";

                    return (
                      <div
                        key={lang}
                        className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-gray-300 font-medium">{lang}</h3>
                          <div className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400">
                            {percentage}%
                          </div>
                        </div>

                        <p className="text-2xl font-bold mb-2">{count}</p>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 flex items-center">
                          <ArrowUpIcon className="w-4 h-4 mr-1 text-green-500" />
                          {Math.floor(Math.random() * 10) + 1}% from last week
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="bg-gray-700/30 rounded-lg p-8 text-center border border-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-gray-400">
                  Complete challenges to see your language statistics!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next quests recommendation */}
        <div
          className={`mt-8 transition-all duration-700 ease-out transform ${
            animate
              ? "translate-y-0 opacity-100 delay-500"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Recommended Next Quests
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:shadow-md">
                <h3 className="text-lg font-medium text-purple-300 mb-2">
                  Arrays Master
                </h3>
                <p className="text-gray-400 mb-3">
                  Complete all array manipulation challenges and earn the Array
                  Master badge!
                </p>
                <Link
                  to="/concept/arrays"
                  className="px-3 py-1.5 bg-purple-700 text-white rounded-lg inline-block hover:bg-purple-600 transition-colors text-sm"
                >
                  Continue Quest
                </Link>
              </div>

              <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all hover:shadow-md">
                <h3 className="text-lg font-medium text-blue-300 mb-2">
                  Type System Explorer
                </h3>
                <p className="text-gray-400 mb-3">
                  Master TypeScript's type system with these advanced type
                  challenges.
                </p>
                <Link
                  to="/concept/type-annotations"
                  className="px-3 py-1.5 bg-blue-700 text-white rounded-lg inline-block hover:bg-blue-600 transition-colors text-sm"
                >
                  Start Quest
                </Link>
              </div>

              <div className="bg-green-900/20 rounded-lg p-6 border border-green-500/30 hover:border-green-500/50 transition-all hover:shadow-md">
                <h3 className="text-lg font-medium text-green-300 mb-2">
                  Daily Challenge
                </h3>
                <p className="text-gray-400 mb-3">
                  Keep your streak alive! Solve today's challenge for bonus XP.
                </p>
                <Link
                  to="/challenges"
                  className="px-3 py-1.5 bg-green-700 text-white rounded-lg inline-block hover:bg-green-600 transition-colors text-sm"
                >
                  Accept Challenge
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Missing CheckIcon component
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default Dashboard;
