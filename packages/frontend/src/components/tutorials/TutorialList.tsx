import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getTutorials, Tutorial } from '../../api/tutorials';
import ApiDebugger from './ApiDebugger';

interface TutorialListProps {
  category?: string;
  language?: string;
}

export default function TutorialList({ category, language }: TutorialListProps) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setLoading(true);
        const params: { category?: string; language?: string } = {};
        if (category) params.category = category;
        if (language) params.language = language;

        const data = await getTutorials(params);
        setTutorials(data);
      } catch (err) {
        setError('Failed to load tutorials. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, [category, language]);

  if (loading) return <div className="p-4 text-center">Loading tutorials...</div>;
  if (error) return (
    <>
      <div className="p-4 text-center text-red-500">{error}</div>
      <ApiDebugger />
    </>
  );
  if (tutorials.length === 0) {
    return (
      <>
        <div className="p-4 text-center">
          No tutorials found for the selected criteria.
        </div>
        <ApiDebugger />
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {tutorials.map((tutorial) => (
        <div
          key={tutorial._id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          {tutorial.mainImage && (
            <img
              src={tutorial.mainImage}
              alt={tutorial.title}
              className="w-full h-48 object-cover"
            />
          )}
          {!tutorial.mainImage && (
            <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <BookOpenIcon className="h-20 w-20 text-white" />
            </div>
          )}
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-blue-600">
                {tutorial.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {tutorial.timeToComplete} min
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {tutorial.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              {tutorial.description.length > 120
                ? `${tutorial.description.substring(0, 120)}...`
                : tutorial.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                By {tutorial.author}
              </span>
              <Link
                to={`/tutorials/${tutorial.slug}`}
                className="inline-flex items-center font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Start learning
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}