import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import { Challenge } from "../../types";

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const difficultyVariant = {
    easy: "success",
    medium: "warning",
    hard: "danger",
  } as const;

  return (
    <Link
      to={`/challenge/${challenge.slug}`}
      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {challenge.title}
        </h2>
        <Badge variant={difficultyVariant[challenge.difficulty]}>
          {challenge.difficulty}
        </Badge>
      </div>
      <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
      <div className="flex items-center justify-between">
        <Badge variant="info">{challenge.language}</Badge>
        <span className="text-sm text-gray-500">
          {challenge.testCases.length} test cases
        </span>
      </div>
    </Link>
  );
};

export default ChallengeCard;
