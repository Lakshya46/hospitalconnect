import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Wait for refreshUser to finish

  if (user) {
    // 1. If user is logged in but visiting Hospital pages, let them through
    // This stops the redirect loop when clicking a hospital card
    if (location.pathname.startsWith("/hospital")) {
      return children;
    }

    // 2. Redirect to dashboard ONLY if trying to access Login/Signup/Landing
    const dashboard = user.role === "hospital" ? "/hospital-admin/dashboard" : "/patient/dashboard";
    return <Navigate to={dashboard} replace />;
  }

  return children;
}