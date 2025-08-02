import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Types for API errors
export interface APIError {
  error: string;
  code?: string;
  message?: string;
  details?: string;
}

interface ErrorHandlerProps {
  error: APIError | string | null;
  onRetry?: () => void;
  onClose?: () => void;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onClose,
}) => {
  const navigate = useNavigate();
  const [dismissing, setDismissing] = useState(false);

  // If no error, don't render anything
  if (!error) return null;

  // Extract error details
  let errorCode: string = "unknown_error";
  let errorMessage: string = "An unknown error occurred";

  if (typeof error === "string") {
    errorMessage = error;
  } else if (typeof error === "object") {
    errorCode = error.code || "api_error";
    errorMessage =
      error.message || error.error || "An error occurred with the request";
  }

  // Handle auth-related errors specifically
  const isAuthError =
    errorCode === "auth_required" ||
    errorCode === "token_expired" ||
    errorCode === "invalid_token" ||
    errorCode === "auth_failed" ||
    errorCode === "user_not_found";

  const handleLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login?error=session_expired");
  };

  const handleClose = () => {
    setDismissing(true);
    setTimeout(() => {
      if (onClose) onClose();
      setDismissing(false);
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 max-w-md bg-gray-800 border border-red-500/50 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        dismissing ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-300">
              {isAuthError ? "Authentication Error" : "Error"}
            </h3>
            <p className="mt-1 text-sm text-gray-300">{errorMessage}</p>
            <div className="mt-3 flex gap-x-2">
              {isAuthError && (
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Log in again
                </button>
              )}

              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-3 py-1.5 bg-gray-700 text-gray-200 text-xs font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Try again
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 bg-transparent text-gray-400 text-xs font-medium rounded-md hover:text-white focus:outline-none"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200 focus:outline-none"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandler;
