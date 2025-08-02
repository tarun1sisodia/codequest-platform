import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserCertificates } from "../../api/certificates";
import { Certificate } from "../../types";
import CertificateDisplay from "./CertificateDisplay";
import ErrorHandler, { APIError } from "../ui/ErrorHandler";

const UserCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);
  const [animate, setAnimate] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [userName, setUserName] = useState<string>("");

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const userCertificates = await getUserCertificates();
      setCertificates(userCertificates);
    } catch (err: any) {
      console.error("Error fetching certificates:", err);
      // Extract error information from the response if available
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError({
          error: "Failed to load dashboard statistics",
          message: err.message || "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Animate in elements after a short delay
    setTimeout(() => {
      setAnimate(true);
    }, 100);

    // Get user info from localStorage
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserName(user.username || "Coder");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    fetchCertificates();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCertificateClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 px-4 pb-16">
      {/* Show error handler if there's an error */}
      <ErrorHandler
        error={error}
        onRetry={fetchCertificates}
        onClose={() => setError(null)}
      />

      <div className="container mx-auto max-w-6xl">
        {/* Hero section */}
        <div
          className={`mb-8 transition-all duration-700 ease-out transform ${
            animate ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-900/20">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Your Certificates
            </h1>
            <p className="text-gray-400 mt-1">
              View and download your coding achievement certificates
            </p>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div
            className={`transition-all duration-700 ease-out transform ${
              animate
                ? "translate-y-0 opacity-100 delay-200"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-gray-800 rounded-lg p-10 border border-gray-700 text-center">
              <div className="w-24 h-24 mx-auto mb-6 opacity-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-400">
                No Certificates Yet
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Complete all challenges in a programming language to earn your
                first certificate!
              </p>
              <Link
                to="/learning"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-900/30 inline-block"
              >
                Explore Learning Path
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate._id}
                className={`transition-all duration-700 ease-out transform ${
                  animate
                    ? "translate-y-0 opacity-100 delay-300"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div
                  className="bg-gray-800 rounded-lg border border-purple-500/30 overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  onClick={() => handleCertificateClick(certificate)}
                >
                  {/* Certificate preview */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 relative">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-600/20 rounded-full -ml-10 -mb-10"></div>

                    <div className="text-center relative">
                      <div className="mb-3">
                        <div className="text-sm text-purple-400 mb-1">
                          CodeQuest
                        </div>
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                          Certificate of Achievement
                        </h3>
                        <div className="h-0.5 w-20 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto my-2"></div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">Awarded to</p>
                        <p className="text-lg font-semibold text-white">
                          {userName}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          for mastering
                        </p>
                        <p className="text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase">
                          {certificate.language}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate info */}
                  <div className="p-4 border-t border-purple-500/20">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {formatDate(certificate.earnedAt)}
                      </div>
                      <button className="text-xs px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-full transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateDisplay
          certificate={selectedCertificate}
          userName={userName}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
};

export default UserCertificates;
