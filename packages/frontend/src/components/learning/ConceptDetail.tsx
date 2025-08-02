// Modified ConceptDetail.tsx to properly show language-specific resources
// Path: packages/frontend/src/components/learning/ConceptDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getConceptDetails } from "../../api/learning";
import {
  AcademicCapIcon,
  BeakerIcon,
  LightBulbIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Badge from "../ui/Badge";

interface ConceptDetails {
  concept: {
    name: string;
    description: string;
    category: string;
    language: string; // Added language to use for filtering
    resources: {
      title: string;
      url: string;
      type: string;
    }[];
    dependencies?: string[];
  };
  challenges: {
    _id: string;
    slug: string; // Added slug property
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    language: string; // Added language field to use for filtering
    completed?: boolean;
    locked?: boolean;
  }[];
  nextConcepts?: {
    slug: string;
    name: string;
    unlocked: boolean;
  }[];
}

const ConceptDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [conceptData, setConceptData] = useState<ConceptDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("typescript");

  useEffect(() => {
    const fetchConceptDetails = async () => {
      try {
        setLoading(true);
        const data = await getConceptDetails(slug || "");
        setConceptData(data);

        // Extract language from concept (if it's php-* slug, set language to php)
        if (data.concept && data.concept.slug) {
          if (data.concept.slug.startsWith("php-")) {
            setCurrentLanguage("php");
          } else if (data.concept.language) {
            setCurrentLanguage(data.concept.language);
          }
        }
      } catch (err) {
        setError("Failed to load concept details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchConceptDetails();
    }
  }, [slug]);

  // Filter challenges by language
  const getFilteredChallenges = () => {
    if (!conceptData || !conceptData.challenges) return [];

    // If the concept is PHP-specific (starts with php-), only show PHP challenges
    if (slug?.startsWith("php-")) {
      return conceptData.challenges.filter(
        (challenge) => challenge.language === "php"
      );
    }

    // Default filtering based on current language
    return conceptData.challenges.filter(
      (challenge) =>
        challenge.language === currentLanguage || challenge.language === "all"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !conceptData) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <p className="text-red-700">Error: {error || "Concept not found"}</p>
        <Link to="/learning" className="mt-2 text-blue-600 underline">
          Return to Learning Path
        </Link>
      </div>
    );
  }

  const { concept, nextConcepts } = conceptData;
  const filteredChallenges = getFilteredChallenges();

  // Group challenges by difficulty
  const challengesByDifficulty = filteredChallenges.reduce((acc, challenge) => {
    const difficulty = challenge.difficulty;
    if (!acc[difficulty]) acc[difficulty] = [];
    acc[difficulty].push(challenge);
    return acc;
  }, {} as Record<string, typeof filteredChallenges>);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link
        to="/learning"
        className="text-blue-600 hover:underline flex items-center mb-6"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Learning Path
      </Link>

      {/* Concept header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{concept.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{concept.description}</p>

            <div className="mt-4 flex items-center">
              <Badge variant="info" className="mr-3">
                {concept.category}
              </Badge>

              {/* Display language tag if applicable */}
              {concept.language && concept.language !== "all" && (
                <Badge variant="success" className="mr-3">
                  {concept.language}
                </Badge>
              )}

              {/* Show PHP tag for PHP-specific concepts */}
              {slug?.startsWith("php-") && (
                <Badge variant="success" className="mr-3">
                  PHP
                </Badge>
              )}

              {concept.dependencies && concept.dependencies.length > 0 && (
                <div className="text-sm text-gray-500">
                  Prerequisites: {concept.dependencies.join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex-shrink-0">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border-4 border-blue-100">
              {concept.category === "fundamentals" && (
                <AcademicCapIcon className="w-12 h-12 text-blue-500" />
              )}
              {concept.category === "intermediate" && (
                <BeakerIcon className="w-12 h-12 text-blue-500" />
              )}
              {concept.category === "advanced" && (
                <LightBulbIcon className="w-12 h-12 text-blue-500" />
              )}
            </div>
          </div>
        </div>

        {/* Learning resources */}
        {concept.resources && concept.resources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {concept.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mr-3">
                    {resource.type === "article" && (
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    )}
                    {resource.type === "video" && (
                      <svg
                        className="w-6 h-6 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    {resource.type === "documentation" && (
                      <svg
                        className="w-6 h-6 text-purple-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {resource.title}
                    </div>
                    <div className="text-sm text-gray-500">{resource.type}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Challenges section */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Challenges</h2>

      {/* Language filter when applicable */}
      {!slug?.startsWith("php-") && (
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setCurrentLanguage("typescript")}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentLanguage === "typescript"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            TypeScript
          </button>
          <button
            onClick={() => setCurrentLanguage("php")}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentLanguage === "php"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            PHP
          </button>
        </div>
      )}

      {Object.entries(challengesByDifficulty).length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No challenges available for {currentLanguage}.
          </p>
        </div>
      ) : (
        Object.entries(challengesByDifficulty).map(
          ([difficulty, diffChallenges]) => (
            <div key={difficulty} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                {difficulty === "easy" && (
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                )}
                {difficulty === "medium" && (
                  <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                )}
                {difficulty === "hard" && (
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                )}
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}{" "}
                Challenges
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {diffChallenges.map((challenge) => (
                  <div
                    key={challenge.slug}
                    className={`border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow
                    ${
                      challenge.completed
                        ? "bg-green-50 border-green-200"
                        : challenge.locked
                        ? "bg-gray-50 border-gray-200 opacity-75"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          {challenge.completed ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                          ) : challenge.locked ? (
                            <LockClosedIcon className="w-5 h-5 text-gray-400 mr-2" />
                          ) : null}
                          {challenge.title}
                        </h4>
                        <Badge
                          variant={
                            difficulty === "easy"
                              ? "success"
                              : difficulty === "medium"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {difficulty}
                        </Badge>
                      </div>

                      <p className="mt-2 text-gray-600">
                        {challenge.description}
                      </p>

                      <div className="mt-4 flex justify-between items-center">
                        <Badge variant="info">{challenge.language}</Badge>

                        {challenge.locked ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
                          >
                            Locked
                          </button>
                        ) : (
                          <Link
                            to={`/challenge/${challenge.slug}`}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            {challenge.completed
                              ? "Review Solution"
                              : "Start Challenge"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )
      )}

      {/* Next steps */}
      {nextConcepts && nextConcepts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>

          <div className="grid gap-4 md:grid-cols-3">
            {nextConcepts.map((nextConcept) => (
              <Link
                key={nextConcept.slug}
                to={nextConcept.unlocked ? `/concept/${nextConcept.slug}` : "#"}
                className={`block p-6 border rounded-lg text-center 
                  ${
                    nextConcept.unlocked
                      ? "bg-white border-blue-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75"
                  }`}
              >
                <div className="flex justify-center mb-4">
                  {nextConcept.unlocked ? (
                    <svg
                      className="w-12 h-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  ) : (
                    <LockClosedIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <h3
                  className={`text-lg font-semibold ${
                    nextConcept.unlocked ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {nextConcept.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {nextConcept.unlocked
                    ? "Ready to learn"
                    : "Complete this concept first"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptDetail;
