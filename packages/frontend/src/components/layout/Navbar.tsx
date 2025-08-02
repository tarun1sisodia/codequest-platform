import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const getUserInfo = () => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.log("getUserInfo error:", e);
      return null;
    }
  };

  const user = getUserInfo();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-sm shadow-lg shadow-purple-900/20"
          : "bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
          >
            CodeQuest
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/challenges"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive("/challenge")
                  ? "bg-purple-900/50 text-purple-300 font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Challenges
            </Link>

            <Link
              to="/learning"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive("/learning") || isActive("/concept")
                  ? "bg-purple-900/50 text-purple-300 font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Skill Tree
            </Link>
            
            <Link
              to="/tutorials"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive("/tutorials")
                  ? "bg-purple-900/50 text-purple-300 font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Tutorials
            </Link>

            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive("/leaderboard")
                  ? "bg-purple-900/50 text-purple-300 font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Leaderboard
            </Link>

            {isAuthenticated && (
              <Link
                to="/profile/badges"
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive("/profile/badges")
                    ? "bg-purple-900/50 text-purple-300 font-medium"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Badges
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/profile/certificates"
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive("/profile/certificates")
                    ? "bg-purple-900/50 text-purple-300 font-medium"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Certificates
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "bg-purple-900/50 text-purple-300 font-medium"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center ml-4">
                {user?.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-2 border-2 border-purple-500"
                  />
                )}
                <div className="group relative">
                  <button className="text-gray-300 hover:text-white">
                    {user?.username || "User"}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/";
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md shadow-purple-900/30"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/challenges"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/challenge")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Challenges
            </Link>
            <Link
              to="/learning"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/learning") || isActive("/concept")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Skill Tree
            </Link>
            <Link
              to="/tutorials"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/tutorials")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Tutorials
            </Link>
            <Link
              to="/leaderboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/leaderboard")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Leaderboard
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/profile/badges"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/profile/badges")
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Badges
                </Link>

                <Link
                  to="/profile/certificates"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/profile/certificates")
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Certificates
                </Link>

                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/dashboard")
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                    setMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
