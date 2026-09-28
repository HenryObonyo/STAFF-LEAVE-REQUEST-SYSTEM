import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import LeaveUsagePage from "./pages/LeaveUsagePage";
import ProfilePage from "./pages/ProfilePage";

import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerHistoryPage from "./pages/ManagerHistoryPage";
import TeamCalendarPage from "./pages/TeamCalendarPage";

import HrAdminDashboard from "./pages/HrAdminDashboard";
import EmployeesPage from "./pages/EmployeesPage";
import LeaveTypesPage from "./pages/LeaveTypesPage";

function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "Employee") {
    return <Navigate to="/employee" replace />;
  }

  if (user.role === "Manager") {
    return <Navigate to="/manager" replace />;
  }

  if (user.role === "HR/Admin") {
    return <Navigate to="/hr" replace />;
  }

  return <Navigate to="/login" replace />;
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
              <ProtectedRoute allow={["Employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/usage"
            element={
              <ProtectedRoute allow={["Employee"]}>
                <LeaveUsagePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allow={["Employee"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allow={["Manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/history"
            element={
              <ProtectedRoute allow={["Manager"]}>
                <ManagerHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/calendar"
            element={
              <ProtectedRoute allow={["Manager"]}>
                <TeamCalendarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr"
            element={
              <ProtectedRoute allow={["HR/Admin"]}>
                <HrAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute allow={["HR/Admin"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr/leave-types"
            element={
              <ProtectedRoute allow={["HR/Admin"]}>
                <LeaveTypesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}