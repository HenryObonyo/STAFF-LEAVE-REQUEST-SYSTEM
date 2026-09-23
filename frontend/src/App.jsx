import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import HrAdminDashboard from "./pages/HrAdminDashboard";

// Sends a logged-in user to the dashboard that matches their role,
// and anyone else to the login page.
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "employee") return <Navigate to="/employee" replace />;
  if (user.role === "manager") return <Navigate to="/manager" replace />;
  return <Navigate to="/hr" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allow={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allow={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr"
            element={
              <ProtectedRoute allow={["hr_admin"]}>
                <HrAdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
