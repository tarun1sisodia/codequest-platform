import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Challenge,
  ExecutionResult,
  ConceptProgress,
  Badge,
} from "../../types";
import {
  getChallenge,
  submitSolution,
  getChallengeProgress,
  earnBadge,
} from "../../api/challenges";
import CodeEditor from "./CodeEditor";
import confetti from "canvas-confetti";
import CertificateDisplay from "../certificates/CertificateDisplay";
import { checkCertificateEligibility } from "../../api/certificates";
import api from "../../api/config";

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [results, setResults] = useState<ExecutionResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [conceptProgress, setConceptProgress] =
    useState<ConceptProgress | null>(null);
  const [badgeEarned, setBadgeEarned] = useState<Badge | null>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  const isAuthenticated = !!localStorage.getItem("token");

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Animate in elements after a short delay
    setTimeout(() => {
      setAnimate(true);
    }, 100);

    const fetchChallenge = async () => {
      try {
        if (!id) return;
        const data = await getChallenge(id);
        setChallenge(data);
        setCode(data.template);

        // Check if user is authenticated before fetching progress
        if (
          isAuthenticated &&
          data.conceptTags &&
          data.conceptTags.length > 0
        ) {
          try {
            // Get progress for the primary concept tag
            const primaryConcept = data.conceptTags[0];
            const progress = await getChallengeProgress(primaryConcept);
            setConceptProgress(progress);

            // Enable next button if this challenge is already completed
            if (progress.completedChallenges?.includes(data.slug)) {
              setNextEnabled(true);
            }
          } catch (err) {
            console.error("Failed to fetch progress:", err);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch challenge");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id, isAuthenticated]);

  useEffect(() => {
    // Reset states when the challenge ID changes
    setResults(null);
    setError(null);
    setNextEnabled(false);
  }, [id]);

  useEffect(() => {
    // Add this to the useEffect where you load user info:
    // Get username from localStorage
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserName(user.username || "Coder");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  });

  const handleSubmit = async () => {
    if (!challenge) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitSolution(
        challenge.slug,
        code,
        challenge.language
      );
      setResults(result.results);

      // Check if all tests passed
      const allPassed =
        Array.isArray(result.results) && result.results.every((r) => r.passed);

      if (allPassed) {
        setNextEnabled(true);
        // Trigger confetti
        triggerConfetti();

        // Check if a certificate was awarded
        if (result.certificateAwarded && result.certificate) {
          setCertificateData(result.certificate);
          setTimeout(() => {
            setShowCertificateModal(true);
          }, 1500); // Show certificate modal after a short delay
        }

        // Check if this completes a concept
        else if (
          isAuthenticated &&
          challenge.conceptTags &&
          challenge.conceptTags.length > 0 &&
          conceptProgress &&
          conceptProgress.completed + 1 >= conceptProgress.totalChallenges &&
          !conceptProgress.earnedBadge
        ) {
          try {
            // Award badge
            const badgeResult = await earnBadge(challenge.conceptTags[0]);
            setBadgeEarned(badgeResult.badge);
            setShowBadgeModal(true);
          } catch (err) {
            console.error("Failed to award badge:", err);
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(`Failed to submit solution: ${error.message}`);
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextChallenge = async () => {
    if (
      !challenge ||
      !challenge.conceptTags ||
      challenge.conceptTags.length === 0
    )
      return;

    try {
      setNextLoading(true);

      // Use the improved next challenge API to get either the next in concept,
      // the first from next concept, or completion message
      const response = await api.get("/api/challenges/next", {
        params: {
          conceptTag: challenge.conceptTags[0],
          currentSlug: challenge.slug,
          language: challenge.language,
        },
      });

      const nextData = response.data;

      if (
        nextData.status === "next_in_concept" ||
        nextData.status === "next_concept"
      ) {
        // Navigate to the next challenge
        navigate(`/challenge/${nextData.challenge.slug}`);
      } else if (nextData.status === "all_completed") {
        // Check if eligible for language certificate
        try {
          const certificateCheck = await checkCertificateEligibility(
            challenge.language
          );

          if (certificateCheck.success) {
            // Show certificate modal
            setCertificateData(certificateCheck.certificate);
            setShowCertificateModal(true);
          } else {
            // Navigate to learning path - all done!
            navigate(`/learning`);
          }
        } catch (err) {
          console.error("Failed to check certificate eligibility:", err);
          navigate(`/learning`);
        }
      } else {
        // Fallback to concept complete page
        navigate(`/concept/${challenge.conceptTags[0]}/complete`);
      }
    } catch (err) {
      console.error("Failed to get next challenge:", err);
    } finally {
      setNextLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#9333EA", "#EC4899", "#8B5CF6"],
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "from-green-600 to-green-400";
      case "medium":
        return "from-yellow-600 to-yellow-400";
      case "hard":
        return "from-red-600 to-red-400";
      default:
        return "from-blue-600 to-blue-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading quest data...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
        <div className="max-w-lg mx-auto bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500 mx-auto mb-4"
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

  if (!challenge)
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
          <p className="text-gray-300 mb-4">Quest not found</p>
          <button
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
            onClick={() => navigate("/challenges")}
          >
            Return to Quest List
          </button>
        </div>
      </div>
    );

  // Calculate progress percentage
  const progressPercentage = conceptProgress
    ? (conceptProgress.completed / conceptProgress.totalChallenges) * 100
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header Section */}
      <div
        className={`bg-gray-800 border-b border-purple-500/30 py-4 px-6 shadow-lg shadow-purple-900/20 transition-all duration-500 ease-out transform ${
          animate ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div
              className={`mr-4 w-10 h-10 rounded-lg bg-gradient-to-br ${getDifficultyColor(
                challenge.difficulty
              )} flex items-center justify-center shadow-md`}
            >
              {challenge.difficulty === "easy" && (
                <span className="text-white font-bold">1</span>
              )}
              {challenge.difficulty === "medium" && (
                <span className="text-white font-bold">2</span>
              )}
              {challenge.difficulty === "hard" && (
                <span className="text-white font-bold">3</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {challenge.title}
              </h1>
              <div className="flex items-center text-sm">
                <span
                  className={`px-3 py-0.5 rounded-full font-medium mr-3 ${
                    challenge.difficulty === "easy"
                      ? "bg-green-900/50 text-green-400 border border-green-500/30"
                      : challenge.difficulty === "medium"
                      ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-900/50 text-red-400 border border-red-500/30"
                  }`}
                >
                  {challenge.difficulty === "easy" && "Novice"}
                  {challenge.difficulty === "medium" && "Adept"}
                  {challenge.difficulty === "hard" && "Master"}
                </span>
                <span className="text-gray-400 border border-gray-700 px-3 py-0.5 rounded-full">
                  {challenge.language}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-4 py-2 text-white rounded-lg transition-all duration-300 font-medium ${
                submitting
                  ? "bg-purple-700/50 cursor-wait"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md shadow-purple-900/30 hover:shadow-lg"
              }`}
            >
              {!isAuthenticated
                ? "Login to Submit"
                : submitting
                ? "Running Tests..."
                : "⚔️ Test Your Code"}
            </button>
            {isAuthenticated && (
              <button
                onClick={handleNextChallenge}
                disabled={!nextEnabled || nextLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  nextEnabled && !nextLoading
                    ? "bg-gradient-to-r from-green-600 to-green-400 text-white hover:shadow-lg shadow-md shadow-green-900/30"
                    : "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                }`}
              >
                {nextLoading ? "Loading..." : "Next Quest →"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive Layout */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Column - Instructions and Console (on desktop) */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gray-800 order-1 lg:order-1">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:max-h-[70vh]">
            {/* Quest Progress Bar */}
            {conceptProgress && (
              <div
                className={`mb-6 transition-all duration-700 ease-out transform ${
                  animate
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="bg-gray-900 rounded-lg border border-purple-500/30 p-4 shadow-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-400 font-medium flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Quest Progress
                    </span>
                    <span className="text-white bg-purple-600 px-2 rounded text-xs font-medium">
                      {conceptProgress.completed}/
                      {conceptProgress.totalChallenges}
                      <span className="ml-1">
                        ({Math.round(progressPercentage)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quest Description */}
            <div
              className={`mb-6 transition-all duration-700 delay-300 ease-out transform ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-gray-900 rounded-lg border border-purple-500/30 p-4 shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quest Description
                </h2>
                <p className="text-gray-300">{challenge.description}</p>
              </div>
            </div>

            {/* Learning Resources Section */}
            {challenge.conceptResources &&
              challenge.conceptResources.length > 0 && (
                <div
                  className={`mb-6 transition-all duration-700 delay-700 ease-out transform ${
                    animate
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="bg-gray-900 rounded-lg border border-purple-500/30 p-4 shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      Learning Resources
                    </h2>
                    <ul className="space-y-2">
                      {challenge.conceptResources.map((resource, idx) => (
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
                            {resource.type === "repository" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2 text-green-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"
                                  clipRule="evenodd"
                                />
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
                </div>
              )}

            {challenge.testCases && challenge.testCases.length > 0 && (
              <div
                className={`mb-6 transition-all duration-700 delay-500 ease-out transform ${
                  animate
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="bg-gray-900 rounded-lg border border-blue-500/30 p-4 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Example Test
                  </h2>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="mb-2">
                      <span className="text-purple-300 font-medium">
                        Input:
                      </span>
                      <span className="ml-2 text-green-300 font-mono">
                        {JSON.stringify(challenge.testCases[0].input)}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-300 font-medium">
                        Expected:
                      </span>
                      <span className="ml-2 text-blue-300 font-mono">
                        {JSON.stringify(challenge.testCases[0].expected)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Results */}
            {results && (
              <div
                className={`mt-6 transition-all duration-500 ${
                  results ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="bg-gray-900 rounded-lg border border-purple-500/30 p-4 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Test Results
                  </h2>
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.passed
                            ? "bg-green-900/20 border-green-500/30"
                            : "bg-red-900/20 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {result.passed ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-500 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-500 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            <span className="font-medium text-gray-200">
                              Test {index + 1}:{" "}
                              {result.testCase.description ||
                                `Challenge ${index + 1}`}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${
                              result.passed
                                ? "bg-green-900/50 text-green-300 border border-green-500/50"
                                : "bg-red-900/50 text-red-300 border border-red-500/50"
                            }`}
                          >
                            {result.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                        <div
                          className={`mt-2 rounded-lg border ${
                            result.passed
                              ? "border-green-500/20"
                              : "border-red-500/20"
                          } p-3 bg-gray-800/50`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400 block mb-1">
                                Input:
                              </span>
                              <code className="text-purple-300 font-mono">
                                {JSON.stringify(result.testCase.input)}
                              </code>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-1">
                                Expected:
                              </span>
                              <code className="text-blue-300 font-mono">
                                {JSON.stringify(result.testCase.expected)}
                              </code>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-1">
                                Received:
                              </span>
                              <code
                                className={`font-mono ${
                                  result.passed
                                    ? "text-green-300"
                                    : "text-red-300"
                                }`}
                              >
                                {JSON.stringify(result.output)}
                              </code>
                            </div>
                          </div>
                          {!result.passed && result.error && (
                            <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
                              <span className="text-red-400 font-mono text-sm">
                                {result.error}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary stats */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Tests Passed</div>
                      <div className="text-xl font-bold text-green-400">
                        {results.filter((r) => r.passed).length}/
                        {results.length}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">
                        Execution Time
                      </div>
                      <div className="text-xl font-bold text-blue-400">
                        {Math.round(
                          results.reduce((acc, r) => acc + r.executionTime, 0)
                        )}{" "}
                        ms
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Status</div>
                      <div
                        className={`text-xl font-bold ${
                          results.every((r) => r.passed)
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {results.every((r) => r.passed) ? "COMPLETE" : "FAILED"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Code Editor */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gray-900 order-2 lg:order-2 border-t lg:border-t-0 lg:border-l border-gray-700 h-[60vh] lg:h-auto">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={challenge.language}
              challenge={challenge}
            />
          </div>
        </div>

        {/* Mobile Action Buttons - visible only on smaller screens */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 flex justify-between gap-3 shadow-lg z-10">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 px-4 py-3 text-white rounded-lg transition-all duration-300 font-medium ${
              submitting
                ? "bg-purple-700/50 cursor-wait"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md shadow-purple-900/30"
            }`}
          >
            {!isAuthenticated
              ? "Login to Submit"
              : submitting
              ? "Running Tests..."
              : "⚔️ Test Your Code"}
          </button>

          {isAuthenticated && (
            <button
              onClick={handleNextChallenge}
              disabled={!nextEnabled || nextLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                nextEnabled && !nextLoading
                  ? "bg-gradient-to-r from-green-600 to-green-400 text-white shadow-md shadow-green-900/30"
                  : "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
              }`}
            >
              {nextLoading ? "Loading..." : "Next Quest →"}
            </button>
          )}
        </div>

        {/* Add padding at the bottom to prevent content from being hidden behind the fixed buttons */}
        <div className="lg:hidden h-24"></div>
      </div>

      {/* Badge Modal */}
      {showBadgeModal && badgeEarned && (
        <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg max-w-md text-center border-2 border-purple-500 p-8 shadow-lg shadow-purple-900/50 animate-pop-in mx-4">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Achievement Unlocked!
            </h2>
            <div className="relative mb-8 mt-6">
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-50 blur animate-pulse"></div>
                <img
                  src={badgeEarned.icon}
                  alt={badgeEarned.name}
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              {/* Animated stars */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.8 + 0.2,
                      animation: `twinkle ${
                        1 + Math.random() * 2
                      }s infinite alternate`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {badgeEarned.name}
            </h3>
            <p className="mb-8 text-gray-300">{badgeEarned.description}</p>

            <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-purple-500/30">
              <p className="text-sm text-gray-400">
                <span className="text-purple-400 font-semibold">+100 XP</span> -
                Concept Mastery Bonus
              </p>
            </div>

            <button
              onClick={() => setShowBadgeModal(false)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-900/30 font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && certificateData && (
        <CertificateDisplay
          certificate={certificateData}
          userName={userName}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* CSS for Animations */}
      <style>{`
        @keyframes twinkle {
          from {
            transform: scale(0.5);
            opacity: 0.3;
          }
          to {
            transform: scale(1.5);
            opacity: 0.8;
          }
        }

        @keyframes pop-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          80% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.18, 1.25, 0.6, 1.25) forwards;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default ChallengeDetail;
