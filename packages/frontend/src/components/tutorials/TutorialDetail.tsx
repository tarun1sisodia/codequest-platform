import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CodeBracketIcon, BookOpenIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { getTutorialBySlug, Tutorial as ApiTutorial, updateTutorialProgress } from '../../api/tutorials';
import './TutorialContent.css';

interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: string;
}

interface Step {
  _id: string;
  title: string;
  content: string;
  codeExamples: CodeExample[];
  challengeId?: {
    _id: string;
    title: string;
    slug: string;
    difficulty: string;
  };
}

// Extend the API Tutorial interface with the specific fields we need
interface Tutorial extends ApiTutorial {
  steps: Step[];
  relatedConcepts: Array<{
    _id: string;
    name: string;
    slug: string;
    description: string;
  }>;
}

export default function TutorialDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const data = await getTutorialBySlug(slug!);
        setTutorial(data as Tutorial); // Type assertion since we know our API returns all the fields we need
      } catch (err) {
        setError('Failed to load tutorial. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchTutorial();
  }, [slug]);

  const goToNextStep = async () => {
    if (tutorial && currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
      
      // Track progress (if user is logged in)
      try {
        if (localStorage.getItem('token')) {
          await updateTutorialProgress(tutorial._id, currentStep, true);
        }
      } catch (err) {
        console.error('Error updating progress:', err);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading tutorial...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!tutorial) return <div className="p-4 text-center">Tutorial not found</div>;

  const step = tutorial.steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/tutorials" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Tutorials
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {tutorial.title}
        </h1>
        <div className="flex items-center mb-4 text-sm text-gray-600 dark:text-gray-300">
          <span className="mr-4">Author: {tutorial.author}</span>
          <span className="mr-4">
            Category: <span className="capitalize">{tutorial.category}</span>
          </span>
          <span>Time: {tutorial.timeToComplete} minutes</span>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-200">{tutorial.description}</p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">
            Step {currentStep + 1} of {tutorial.steps.length}
          </span>
          <span className="text-sm">
            {Math.round(((currentStep + 1) / tutorial.steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${((currentStep + 1) / tutorial.steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {step.title}
        </h2>
        <div
          className="prose dark:prose-invert max-w-none mb-6 text-gray-800 dark:text-gray-200 tutorial-content"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />

        {/* Code examples */}
        {step.codeExamples && step.codeExamples.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <CodeBracketIcon className="h-5 w-5 mr-2" />
              Code Examples
            </h3>
            {step.codeExamples.map((example, index) => (
              <div key={index} className="mb-6">
                <h4 className="text-lg font-medium mb-2">{example.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {example.description}
                </p>
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <CodeMirror
                    value={example.code}
                    height="auto"
                    theme={vscodeDark}
                    extensions={[javascript({ jsx: true, typescript: true })]}
                    editable={false}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: false,
                      highlightActiveLine: false,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Practice challenge link */}
        {step.challengeId && (
          <div className="mt-8 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900 dark:border-blue-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Practice Challenge
            </h3>
            <p className="mb-3">
              Ready to apply what you've learned? Try this challenge to test your understanding.
            </p>
            <Link
              to={`/challenges/${step.challengeId.slug}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Start Challenge: {step.challengeId.title}
            </Link>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Previous Step
        </button>
        {currentStep < tutorial.steps.length - 1 ? (
          <button
            onClick={goToNextStep}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next Step
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <Link
            to="/tutorials"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Complete Tutorial
            <CheckIcon className="h-4 w-4 ml-2" />
          </Link>
        )}
      </div>

      {/* Related concepts */}
      {tutorial.relatedConcepts && tutorial.relatedConcepts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Related Concepts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorial.relatedConcepts.map((concept) => (
              <Link
                key={concept._id}
                to={`/concepts/${concept.slug}`}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h4 className="text-lg font-medium mb-1">{concept.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {concept.description.substring(0, 100)}...
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for the check icon
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}