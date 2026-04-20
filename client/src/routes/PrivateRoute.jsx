import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If unauthorized, send them to their own correct dashboard
    const home = user.role === "hospital" ? "/hospital-admin/dashboard" : "/patient/dashboard";
    return <Navigate to={home} replace />;
  }

  return children;
}