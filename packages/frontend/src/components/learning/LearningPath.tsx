import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLearningPath } from "../../api/learning";
import {
  LockClosedIcon,
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  StarIcon,
  BeakerIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import ErrorHandler, { APIError } from "../ui/ErrorHandler";

interface Challenge {
  _id: string;
  slug: string; // Added slug property
  title: string;
  difficulty: "easy" | "medium" | "hard";
  language: string; // Added language property to filter by language
  completed: boolean;
}

interface Concept {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  language: string; // Added language property to filter by language
  order: number;
  resources: { title: string; url: string; type: string }[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  unlocked: boolean;
  challenges: Challenge[];
}

const LearningPath: React.FC = () => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);
  const [activeLanguage, setActiveLanguage] = useState("typescript");
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  const fetchLearningPath = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLearningPath(activeLanguage);
      setConcepts(data);
      // Trigger animations after data is loaded
      setTimeout(() => {
        setAnimateIn(true);
      }, 100);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError({
          error: "Failed to load dashboard statistics",
          message: err.message || "An unexpected error occurred",
        });
      }

      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeLanguage]);

  useEffect(() => {
    fetchLearningPath();
  }, [activeLanguage, fetchLearningPath]);

  // Filter concepts based on the selected language and whether they have challenges
  const filteredConcepts = React.useMemo(() => {
    return concepts.filter((concept) => {
      // First, check if concept should be shown based on language
      let shouldShowByLanguage = false;

      // Show all concepts that match 'all' language or the currently selected language
      if (concept.language === "all") shouldShowByLanguage = true;
      // For PHP, show only PHP-specific concepts
      else if (activeLanguage === "php") {
        shouldShowByLanguage =
          concept.language === "php" || concept.slug.startsWith("php-");
      }
      // For Go, show only Go-specific concepts
      else if (activeLanguage === "go") {
        shouldShowByLanguage =
          concept.language === "go" || concept.slug.includes("-go");
      }
      // For TypeScript, filter out PHP and Go-specific concepts
      else if (activeLanguage === "typescript") {
        shouldShowByLanguage =
          concept.language !== "php" && 
          concept.language !== "go" && 
          !concept.slug.startsWith("php-") && 
          !concept.slug.includes("-go");
      } else {
        shouldShowByLanguage = true;
      }

      // If concept doesn't pass language filter, return false immediately
      if (!shouldShowByLanguage) return false;

      // Now check if this concept has any challenges for the current language
      const hasValidChallenges = concept.challenges.some((challenge) => {
        if (activeLanguage === "php") {
          return challenge.language === "php";
        } else if (activeLanguage === "go") {
          return challenge.language === "go";
        } else {
          return (
            challenge.language === "typescript" ||
            challenge.language === "javascript"
          );
        }
      });

      // Only show concept if it has at least one valid challenge
      return hasValidChallenges;
    });
  }, [concepts, activeLanguage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading skill tree...</p>
        </div>
      </div>
    );
  }

  // Get category-based icon component
  const getCategoryIcon = (category: string, size = 8) => {
    switch (category) {
      case "fundamentals":
        return <StarIcon className={`w-${size} h-${size} text-yellow-500`} />;
      case "intermediate":
        return <BeakerIcon className={`w-${size} h-${size} text-blue-500`} />;
      case "advanced":
        return <FireIcon className={`w-${size} h-${size} text-red-500`} />;
      default:
        return (
          <BookOpenIcon className={`w-${size} h-${size} text-purple-500`} />
        );
    }
  };

  // Filter challenges in a concept by the active language
  const getFilteredChallenges = (concept: Concept) => {
    return concept.challenges.filter((challenge) => {
      if (activeLanguage === "php") {
        return challenge.language === "php";
      } else if (activeLanguage === "go") {
        return challenge.language === "go";
      } else {
        return (
          challenge.language === "typescript" ||
          challenge.language === "javascript"
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-4">
      {/* Show error handler if there's an error */}
      <ErrorHandler
        error={error}
        onRetry={fetchLearningPath}
        onClose={() => setError(null)}
      />

      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Skill Tree
            </h1>
            <p className="text-gray-400 mt-1">
              Master programming concepts and level up your abilities
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-1 flex shadow-lg shadow-purple-900/20">
            <button
              className={`px-4 py-2 rounded-md transition-all ${
                activeLanguage === "typescript"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveLanguage("typescript")}
            >
              TypeScript
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-all ${
                activeLanguage === "php"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveLanguage("php")}
            >
              PHP
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-all ${
                activeLanguage === "go"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveLanguage("go")}
            >
              Go
            </button>
          </div>
        </div>

        {/* Learning path visualization */}
        <div className="relative pb-16">
          {/* Vertical skill path line */}
          <div className="absolute left-8 sm:left-16 top-10 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 z-0 hidden md:block"></div>

          {filteredConcepts.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="w-24 h-24 mx-auto mb-6 opacity-30">
                <BookOpenIcon className="w-full h-full text-gray-600" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-400">
                No Concepts Available
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                There are no learning concepts available for {activeLanguage}.
                Try switching languages or check back later.
              </p>
            </div>
          ) : (
            filteredConcepts.map((concept, index) => (
              <div
                key={concept._id}
                className={`
                  mb-8 relative 
                  transition-all duration-700 ease-out transform 
                  ${
                    animateIn
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Connector for desktop */}
                <div
                  className={`absolute left-8 sm:left-16 top-10 w-8 h-1 hidden md:block
                    ${
                      concept.unlocked
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-700"
                    }`}
                ></div>

                <div
                  className={`
                    rounded-xl border-2 transition-all duration-300 hover:shadow-lg relative overflow-hidden
                    ${
                      expandedConcept === concept.slug
                        ? "shadow-lg shadow-purple-900/30"
                        : ""
                    }
                    ${
                      concept.unlocked
                        ? concept.progress.percentage === 100
                          ? "border-green-500/50 bg-gray-800"
                          : "border-purple-500/50 bg-gray-800"
                        : "border-gray-700 bg-gray-800/50 opacity-75"
                    }
                  `}
                >
                  {/* Progress bar on top */}
                  {concept.unlocked && (
                    <div className="absolute top-0 left-0 right-0 h-1">
                      <div
                        className={`h-full ${
                          concept.progress.percentage === 100
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                        style={{ width: `${concept.progress.percentage}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Concept header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() =>
                      setExpandedConcept(
                        expandedConcept === concept.slug ? null : concept.slug
                      )
                    }
                  >
                    <div className="flex items-start">
                      {/* Status indicator */}
                      <div className="flex-shrink-0 mr-6 relative z-10">
                        <div
                          className={`w-16 h-16 flex items-center justify-center rounded-full border-2
                          ${
                            concept.progress.percentage === 100
                              ? "bg-green-900/30 border-green-500"
                              : concept.unlocked
                              ? "bg-purple-900/30 border-purple-500"
                              : "bg-gray-800 border-gray-700"
                          }`}
                        >
                          {concept.progress.percentage === 100 ? (
                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                          ) : concept.unlocked ? (
                            getCategoryIcon(concept.category, 8)
                          ) : (
                            <LockClosedIcon className="w-8 h-8 text-gray-500" />
                          )}
                        </div>

                        {/* Level badge */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-700 border border-gray-600 text-xs flex items-center justify-center">
                          {concept.order}
                        </div>
                      </div>

                      {/* Concept info */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2
                              className={`text-xl font-semibold ${
                                concept.unlocked
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            >
                              {concept.name}
                              {/* Add language badge for PHP concepts */}
                              {concept.language === "php" ||
                              concept.slug.startsWith("php-") ? (
                                <span className="ml-2 text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full">
                                  PHP
                                </span>
                              ) : null}
                            </h2>
                            <p
                              className={`text-sm mt-1 ${
                                concept.unlocked
                                  ? "text-gray-300"
                                  : "text-gray-600"
                              }`}
                            >
                              {concept.description}
                            </p>
                          </div>

                          {/* Progress indicator */}
                          <div className="ml-4 flex-shrink-0">
                            <div
                              className={`px-3 py-1 rounded-full text-center text-sm ${
                                concept.progress.percentage === 100
                                  ? "bg-green-900/30 text-green-400 border border-green-500/50"
                                  : concept.unlocked
                                  ? "bg-purple-900/30 text-purple-300 border border-purple-500/50"
                                  : "bg-gray-800 text-gray-500 border border-gray-700"
                              }`}
                            >
                              {concept.progress.completed}/
                              {concept.progress.total}
                              <span className="ml-1 text-xs">
                                {concept.progress.percentage === 100
                                  ? "✓"
                                  : concept.unlocked
                                  ? "quests"
                                  : "locked"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* XP Bar (replaces progress bar) */}
                        <div className="mt-4 flex items-center">
                          <div className="text-xs text-gray-500 mr-2">XP</div>
                          <div className="flex-grow h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div
                              className={`h-full rounded-full ${
                                concept.progress.percentage === 100
                                  ? "bg-gradient-to-r from-green-500 to-green-300"
                                  : "bg-gradient-to-r from-purple-600 to-pink-600"
                              }`}
                              style={{
                                width: `${concept.progress.percentage}%`,
                              }}
                            ></div>
                          </div>
                          <div className="ml-2 text-xs font-medium text-gray-400">
                            {concept.progress.percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded content - challenges */}
                {expandedConcept === concept.slug && (
                  <div className="px-6 pb-6 pt-4 border-t border-gray-700/50 ml-12">
                    <h3 className="text-lg font-medium text-purple-400 mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      Available Quests
                    </h3>

                    {/* Filter challenges by the active language */}
                    {getFilteredChallenges(concept).length === 0 ? (
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-gray-400 italic text-center">
                        No {activeLanguage} quests available for this concept
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {getFilteredChallenges(concept).map((challenge) => (
                          <Link
                            key={challenge.slug}
                            to={`/challenge/${challenge.slug}`}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:scale-103 hover:shadow-md hover:shadow-purple-900/20
                              ${
                                challenge.completed
                                  ? "bg-green-900/20 border-green-500/30 hover:border-green-500/50"
                                  : "bg-gray-800 border-purple-500/30 hover:border-purple-500/50"
                              }`}
                          >
                            <div className="flex items-center">
                              {challenge.completed ? (
                                <div className="w-8 h-8 rounded-full bg-green-900/50 border border-green-500/50 flex items-center justify-center mr-3">
                                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center mr-3">
                                  <PlayIcon className="w-5 h-5 text-purple-400" />
                                </div>
                              )}
                              <span
                                className={
                                  challenge.completed
                                    ? "text-green-300"
                                    : "text-gray-200"
                                }
                              >
                                {challenge.title}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium 
                                ${
                                  challenge.difficulty === "easy"
                                    ? "bg-green-900/30 text-green-400 border border-green-500/50"
                                    : challenge.difficulty === "medium"
                                    ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/50"
                                    : "bg-red-900/30 text-red-400 border border-red-500/50"
                                }`}
                              >
                                {challenge.difficulty === "easy" && "⭐ Novice"}
                                {challenge.difficulty === "medium" &&
                                  "⭐⭐ Adept"}
                                {challenge.difficulty === "hard" &&
                                  "⭐⭐⭐ Master"}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Learning resources section */}
                    {concept.resources && concept.resources.length > 0 && (
                      <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-purple-400 mb-3 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                          Knowledge Scrolls
                        </h3>
                        <ul className="space-y-2">
                          {concept.resources.map((resource, idx) => (
                            <li key={idx}>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 hover:underline flex items-center p-2 rounded-md hover:bg-gray-700/50 transition-colors"
                              >
                                {resource.type === "documentation" && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-purple-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                  </svg>
                                )}
                                {resource.type === "article" && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-blue-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                {resource.type === "video" && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                )}
                                {resource.title}
                                <span className="ml-2 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                                  {resource.type}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Gaming footer with stats */}
        <div className="bg-gray-800 border border-purple-500/30 rounded-lg mt-8 p-6 shadow-lg shadow-purple-900/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            Daily Quests & Stats
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/20">
              <div className="text-sm text-gray-400 mb-1">Skill Progress</div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(
                  concepts.reduce(
                    (acc, concept) => acc + concept.progress.percentage,
                    0
                  ) / Math.max(concepts.length, 1)
                )}
                %
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Overall completion
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/20">
              <div className="text-sm text-gray-400 mb-1">Skills Mastered</div>
              <div className="text-2xl font-bold text-green-400">
                {concepts.filter((c) => c.progress.percentage === 100).length}/
                {concepts.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Complete all for bonus XP
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/20">
              <div className="text-sm text-gray-400 mb-1">
                Challenges Completed
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {concepts.reduce(
                  (acc, concept) => acc + concept.progress.completed,
                  0
                )}
                /
                {concepts.reduce(
                  (acc, concept) => acc + concept.progress.total,
                  0
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Keep up the great work!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
