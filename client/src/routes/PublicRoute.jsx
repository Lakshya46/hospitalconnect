import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    // 🔥 redirect based on role
    if (role === "patient") return <Navigate to="/patient/dashboard" />;
    if (role === "hospital") return <Navigate to="/hospital-admin/dashboard" />;
  }

  return children;
}