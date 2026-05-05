import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Don't make any decisions until the session check completes
  if (loading) return null;

  // If no user after loading, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  return children;
}