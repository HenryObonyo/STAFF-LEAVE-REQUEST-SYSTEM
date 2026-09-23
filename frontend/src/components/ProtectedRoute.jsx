import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any page that requires login and, optionally, a specific role.
// Usage: <ProtectedRoute allow={["manager"]}><ManagerDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, allow }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
