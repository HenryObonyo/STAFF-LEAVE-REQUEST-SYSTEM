import { useAuth } from "../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import "../styles/dashboard.css";

const NAV_BY_ROLE = {
  Employee: [
    { label: "My Requests", path: "/employee", end: true },
    { label: "Leave Usage", path: "/employee/usage" },
    { label: "Profile", path: "/employee/profile" },
  ],

  Manager: [
    { label: "Team Requests", path: "/manager", end: true },
    { label: "History", path: "/manager/history" },
    { label: "Team Calendar", path: "/manager/calendar" },
  ],

  "HR/Admin": [
    { label: "Overview", path: "/hr", end: true },
    { label: "Employees", path: "/hr/employees" },
    { label: "Leave Types", path: "/hr/leave-types" },
  ],
};
export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = NAV_BY_ROLE[user?.role] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__mark">LR</span>
          <span className="sidebar__name">Leave Portal</span>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                "nav-link" + (isActive ? " is-active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar__logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div>
            <p className="dash-header__eyebrow">
              {user?.role === "HR/Admin" ? "HR / Admin" : user?.role}
            </p>
            <h1>{title}</h1>
          </div>
          <div className="dash-header__profile">
            <div className="avatar">{initials}</div>
            <div className="dash-header__profile-text">
              <span className="name">{user?.name}</span>
              <span className="role">{user?.email}</span>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}