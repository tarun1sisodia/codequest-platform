// packages/frontend/src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Login, AuthCallback } from "./components/auth";
import Dashboard from "./components/dashboard";
import ChallengeList from "./components/challenges/ChallengeList";
import ChallengeDetail from "./components/challenges/ChallengeDetail";
import Layout from "./components/layout/Layout";
import HomePage from "./components/home";
import LearningPath from "./components/learning/LearningPath";
import ConceptDetail from "./components/learning/ConceptDetail";
import TutorialList from "./components/tutorials/TutorialList";
import TutorialDetail from "./components/tutorials/TutorialDetail";
import ConceptCompletePage from "./components/challenges/ConceptCompletePage";
import UserBadges from "./components/challenges/UserBadges";
import UserCertificates from "./components/certificates/UserCertificates";
import LeaderboardPage from "./components/leaderboard";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login with the current path to redirect back after login
    return (
      <Navigate
        to="/login"
        state={{
          returnTo: location.pathname,
          message: "Please log in to access this page",
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/github/callback" element={<AuthCallback />} />
        <Route path="/auth/success" element={<AuthCallback />} />

        {/* Main layout with both public and protected routes */}
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="challenges" element={<ChallengeList />} />
          <Route path="challenge/:id" element={<ChallengeDetail />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />

          {/* Learning path routes */}
          <Route path="learning" element={<LearningPath />} />
          <Route path="concept/:slug" element={<ConceptDetail />} />
          <Route
            path="/concept/:conceptTag/complete"
            element={<ConceptCompletePage />}
          />
          
          {/* Tutorial routes */}
          <Route path="tutorials" element={<TutorialList />} />
          <Route path="tutorials/:slug" element={<TutorialDetail />} />
          {/* Protected routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/certificates"
            element={
              <ProtectedRoute>
                <UserCertificates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/badges"
            element={
              <ProtectedRoute>
                <UserBadges />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
