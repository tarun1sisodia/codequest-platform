import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-gray-900"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Animated code symbols */}
          <div
            className={`transition-opacity duration-1000 ${
              loaded ? "opacity-20" : "opacity-0"
            }`}
          >
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-purple-300/10 text-4xl transform rotate-6"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${
                    5 + Math.random() * 10
                  }s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              >
                {
                  [
                    "{ }",
                    "[ ]",
                    "( )",
                    "//",
                    "&&",
                    "||",
                    "=>",
                    "+=",
                    "*=",
                    "++",
                    "--",
                  ][Math.floor(Math.random() * 11)]
                }
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className={`transition-all duration-1000 ease-out transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              } text-5xl md:text-6xl font-bold mb-4`}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                CodeQuest
              </span>
            </h1>
            <p
              className={`transition-all duration-1000 delay-300 ease-out transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              } text-xl md:text-2xl text-gray-300 mb-8`}
            >
              Level up your coding skills through interactive challenges, earn
              badges, and climb the leaderboard
            </p>

            <div
              className={`transition-all duration-1000 delay-500 ease-out transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              } flex flex-col sm:flex-row justify-center gap-4`}
            >
              <Link
                to="/challenges"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-900/30"
              >
                Start Your Quest
              </Link>
              <Link
                to="/learning"
                className="px-8 py-4 bg-gray-800 rounded-lg text-gray-300 font-bold hover:bg-gray-700 hover:text-white transform hover:scale-105 transition-all duration-200 border border-purple-500/30"
              >
                View Skill Tree
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Embark on Your Coding Adventure
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`transition-all duration-700 delay-300 transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              } bg-gray-900 rounded-xl p-6 border border-purple-500/20 shadow-xl hover:shadow-purple-600/20 transition-all duration-300 hover:scale-105`}
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">
                Master Coding Challenges
              </h3>
              <p className="text-gray-400">
                Practice with TypeScript and JavaScript challenges that test
                your skills and expand your knowledge
              </p>
            </div>

            <div
              className={`transition-all duration-700 delay-500 transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              } bg-gray-900 rounded-xl p-6 border border-pink-500/20 shadow-xl hover:shadow-pink-600/20 transition-all duration-300 hover:scale-105`}
            >
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">
                Earn Achievement Badges
              </h3>
              <p className="text-gray-400">
                Complete sets of challenges to unlock badges that showcase your
                programming prowess
              </p>
            </div>

            <div
              className={`transition-all duration-700 delay-700 transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              } bg-gray-900 rounded-xl p-6 border border-blue-500/20 shadow-xl hover:shadow-blue-600/20 transition-all duration-300 hover:scale-105`}
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
              <p className="text-gray-400">
                Watch your skills grow with detailed statistics and visualize
                your learning journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW CERTIFICATE SECTION */}
      <div className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Earn Prestigious Certificates
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Certificate mockup */}
            <div
              className={`transition-all duration-700 delay-300 transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              } bg-[#151823] rounded-lg border-2 border-purple-500 shadow-2xl p-8 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full -ml-10 -mb-10"></div>

              <div className="text-center relative z-10">
                <div className="text-xl text-purple-400 font-semibold mb-2">
                  CodeQuest
                </div>
                <div className="h-6 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mb-6"></div>

                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                  Certificate of Achievement
                </h1>
                <div className="h-1 w-64 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-8"></div>

                <p className="text-xl mb-4">This certifies that</p>
                <p className="text-4xl font-bold mb-4">Coding Champion</p>
                <p className="text-xl mb-2">
                  has successfully completed all challenges in
                </p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase mb-8">
                  TypeScript
                </p>

                {/* Certificate seal */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 relative">
                    <div className="absolute inset-0 w-full h-full text-purple-600">
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-purple-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate info */}
            <div
              className={`transition-all duration-700 delay-500 transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h3 className="text-2xl font-bold mb-6 text-purple-400">
                Showcase Your Achievements
              </h3>
              <div className="space-y-6 text-gray-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-white">
                      Complete Your Learning Path
                    </h4>
                    <p className="mt-2">
                      Master all challenges in a programming language to unlock
                      a beautiful, sharable certificate of achievement.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-600 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-white">
                      Download & Share
                    </h4>
                    <p className="mt-2">
                      Download your personalized certificate as a PDF and share
                      it on LinkedIn, your portfolio, or resume to showcase your
                      skills.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-white">
                      Boost Your Career
                    </h4>
                    <p className="mt-2">
                      Stand out to potential employers by demonstrating your
                      commitment to learning and mastering programming skills.
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <Link
                    to="/learning"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-900/30 inline-flex items-center"
                  >
                    Start Your Path to Certification
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials Section */}
      <div className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Master Web Development Through Tutorials
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div
              className={`transition-all duration-700 delay-300 transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h3 className="text-2xl font-bold mb-6 text-blue-400">
                Learn At Your Own Pace
              </h3>
              <div className="space-y-6 text-gray-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-white">
                      Step-by-Step Guidance
                    </h4>
                    <p className="mt-2">
                      Follow comprehensive tutorials that break down complex web development concepts into manageable steps.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-white">
                      Interactive Code Examples
                    </h4>
                    <p className="mt-2">
                      Each tutorial includes practical code examples that you can study and implement in your own projects.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-600 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-white">
                      Apply Your Knowledge
                    </h4>
                    <p className="mt-2">
                      Test your understanding with coding challenges at the end of each tutorial to reinforce your learning.
                    </p>
                  </div>
                </div>
                
                <div className="pt-5">
                  <Link
                    to="/tutorials"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-900/30 inline-flex items-center"
                  >
                    Browse Tutorials
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div
              className={`transition-all duration-700 delay-500 transform ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/20 shadow-xl hover:shadow-blue-600/20 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4">Featured Tutorial</h3>
                
                <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 h-52 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2">Data Rendering Patterns in React</h4>
                <p className="text-gray-300 mb-4">Learn essential patterns for rendering data efficiently in React applications, from basic listings to advanced virtualization techniques.</p>
                
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    45 mins
                  </span>
                  <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
                    Intermediate
                  </span>
                </div>
                
                <Link to="/tutorials/data-rendering-patterns-react" className="block w-full text-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Start Learning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-purple-900/30 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to become a coding champion?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of developers improving their skills through
              interactive challenges
            </p>

            <Link
              to="/challenges"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-900/30 inline-block"
            >
              Begin Your Adventure
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for Floating Animation */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(6deg);
          }
          50% {
            transform: translateY(-20px) rotate(-3deg);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
