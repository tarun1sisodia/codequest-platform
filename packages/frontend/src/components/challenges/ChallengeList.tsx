import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Challenge } from "../../types";
import { getChallenges } from "../../api/challenges";

const ChallengeList: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [conceptFilter, setConceptFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  // Extract unique concept tags from challenges
  const [conceptTags, setConceptTags] = useState<string[]>([]);

  useEffect(() => {
    // Animate in elements after a short delay
    setTimeout(() => {
      setAnimate(true);
    }, 100);

    const fetchChallenges = async () => {
      try {
        const data = await getChallenges();
        setChallenges(data);

        // Extract unique concept tags
        const allTags = data.flatMap(
          (challenge) => challenge.conceptTags || []
        );
        const uniqueTags = [...new Set(allTags)];
        setConceptTags(uniqueTags);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch challenges");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // Filter challenges based on selected filters
  const filteredChallenges = challenges.filter((challenge) => {
    const difficultyMatch = filter === "all" || challenge.difficulty === filter;
    const languageMatch =
      languageFilter === "all" || challenge.language === languageFilter;
    const conceptMatch =
      conceptFilter === "all" ||
      (challenge.conceptTags && challenge.conceptTags.includes(conceptFilter));

    return difficultyMatch && conceptMatch && languageMatch;
  });

  // Group challenges by concept
  const challengesByConceptMap: Record<string, Challenge[]> = {};

  // Only process if we have filtered challenges
  if (filteredChallenges.length > 0) {
    filteredChallenges.forEach((challenge) => {
      // Skip if no concept tags
      if (!challenge.conceptTags || challenge.conceptTags.length === 0) {
        if (!challengesByConceptMap["uncategorized"]) {
          challengesByConceptMap["uncategorized"] = [];
        }
        challengesByConceptMap["uncategorized"].push(challenge);
        return;
      }

      // Add to each concept category
      challenge.conceptTags.forEach((concept) => {
        if (!challengesByConceptMap[concept]) {
          challengesByConceptMap[concept] = [];
        }
        challengesByConceptMap[concept].push(challenge);
      });
    });
  }

  // Get difficulty label and classes
  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          label: "Novice",
          bgClass: "bg-green-900/30",
          textClass: "text-green-400",
          borderClass: "border-green-500/50",
        };
      case "medium":
        return {
          label: "Adept",
          bgClass: "bg-yellow-900/30",
          textClass: "text-yellow-400",
          borderClass: "border-yellow-500/50",
        };
      case "hard":
        return {
          label: "Master",
          bgClass: "bg-red-900/30",
          textClass: "text-red-400",
          borderClass: "border-red-500/50",
        };
      default:
        return {
          label: "Unknown",
          bgClass: "bg-blue-900/30",
          textClass: "text-blue-400",
          borderClass: "border-blue-500/50",
        };
    }
  };

  // Format concept name for display
  const formatConceptName = (tag: string) => {
    return tag
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading quests data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
        <div className="max-w-lg mx-auto bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
        <div className="max-w-lg mx-auto bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="h-12 w-12 text-gray-500 mx-auto mb-4">🔍</div>
          <p className="text-gray-300 mb-4">No quests available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-4 pb-16">
      <div className="container mx-auto max-w-6xl">
        {/* Hero section */}
        <div
          className={`mb-8 transition-all duration-700 ease-out transform ${
            animate ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-900/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Quest Board
                </h1>
                <p className="text-gray-400 mt-1">
                  Choose your next challenge and forge your path to mastery
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All Levels
                </button>
                <button
                  onClick={() => setFilter("easy")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filter === "easy"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Novice
                </button>
                <button
                  onClick={() => setFilter("medium")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filter === "medium"
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Adept
                </button>
                <button
                  onClick={() => setFilter("hard")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filter === "hard"
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Master
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setLanguageFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    languageFilter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All Languages
                </button>
                <button
                  onClick={() => setLanguageFilter("typescript")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    languageFilter === "typescript"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  TypeScript
                </button>
                <button
                  onClick={() => setLanguageFilter("php")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    languageFilter === "php"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  PHP
                </button>
                <button
                  onClick={() => setLanguageFilter("go")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    languageFilter === "go"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Concept filter */}
        <div
          className={`mb-8 transition-all duration-700 ease-out transform ${
            animate
              ? "translate-y-0 opacity-100 delay-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center mb-2">
              <span className="text-purple-400 mr-2">🔍</span>
              <h2 className="text-lg font-medium text-white">
                Filter by Skill
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setConceptFilter("all")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  conceptFilter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All Skills
              </button>

              {conceptTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setConceptFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    conceptFilter === tag
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {formatConceptName(tag)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display challenges by concept */}
        {Object.keys(challengesByConceptMap).length > 0 ? (
          Object.entries(challengesByConceptMap).map(
            ([concept, challenges], index) => (
              <div
                key={concept}
                className={`mb-8 transition-all duration-700 ease-out transform ${
                  animate
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20 shadow-md">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <span className="text-blue-400 mr-2">💻</span>
                    {formatConceptName(concept)} Quests
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {challenges.map((challenge) => {
                      const difficulty = getDifficultyInfo(
                        challenge.difficulty
                      );

                      return (
                        <Link
                          key={challenge.slug}
                          to={`/challenge/${challenge.slug}`}
                          className="bg-gray-900/75 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300 hover:shadow-md hover:shadow-purple-900/10 flex flex-col"
                        >
                          <div className="p-4 flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-medium text-white">
                                {challenge.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficulty.bgClass} ${difficulty.textClass} border ${difficulty.borderClass}`}
                              >
                                {difficulty.label}
                              </span>
                            </div>

                            <p className="text-gray-400 mb-4 line-clamp-2">
                              {challenge.description}
                            </p>

                            <div className="flex items-center text-sm text-gray-500">
                              <span className="bg-gray-800 px-2 py-0.5 rounded-full text-xs border border-gray-700">
                                {challenge.language}
                              </span>
                              <span className="ml-2 text-xs">
                                {challenge.testCases.length} test cases
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto border-t border-gray-800">
                            <div className="p-3 flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                Begin Quest
                              </span>
                              <span className="text-purple-400">→</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <div className="h-12 w-12 text-gray-600 mx-auto mb-4">🔍</div>
            <p className="text-gray-400 mb-4">
              No quests match your current filters
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setConceptFilter("all");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Stats section */}
        <div
          className={`mt-12 transition-all duration-700 ease-out transform ${
            animate
              ? "translate-y-0 opacity-100 delay-700"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20 shadow-md">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="text-purple-400 mr-2">📊</span>
              Quest Statistics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-sm text-gray-400 mb-1">Total Quests</h3>
                <p className="text-2xl font-bold text-white">
                  {challenges.length}
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-sm text-gray-400 mb-1">Novice Quests</h3>
                <p className="text-2xl font-bold text-green-400">
                  {challenges.filter((c) => c.difficulty === "easy").length}
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-sm text-gray-400 mb-1">Adept Quests</h3>
                <p className="text-2xl font-bold text-yellow-400">
                  {challenges.filter((c) => c.difficulty === "medium").length}
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-red-500/20">
                <h3 className="text-sm text-gray-400 mb-1">Master Quests</h3>
                <p className="text-2xl font-bold text-red-400">
                  {challenges.filter((c) => c.difficulty === "hard").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeList;
