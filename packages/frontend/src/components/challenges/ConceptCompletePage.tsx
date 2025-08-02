import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserBadges } from "../../api/challenges";
import { Badge } from "../../types";

const ConceptCompletePage: React.FC = () => {
  const { conceptTag } = useParams<{ conceptTag: string }>();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        setLoading(true);
        const badges = await getUserBadges();
        const conceptBadge = badges.find((b) => b.conceptTag === conceptTag);
        setBadge(conceptBadge || null);
      } catch (error) {
        console.error("Error fetching badge:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadge();
  }, [conceptTag]);

  // Format the concept name for display
  const formatConceptName = (tag: string) => {
    return tag
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Congratulations! 🎉</h1>
        <p className="text-xl mb-8">
          You've completed all the {formatConceptName(conceptTag || "")}{" "}
          challenges!
        </p>

        {badge && (
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-4">
              <img
                src={badge.icon}
                alt={badge.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-2">{badge.name}</h2>
            <p className="text-gray-600">{badge.description}</p>
          </div>
        )}

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center mt-8">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>

          <Link
            to="/challenges"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Explore More Challenges
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConceptCompletePage;
