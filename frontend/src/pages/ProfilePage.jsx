import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Your profile">
      <section className="panel">
        <h2>Account details</h2>
        <ul className="kv-list">
          <li>
            <span className="kv-label">Full name</span>
            <span className="kv-value">{user?.name}</span>
          </li>
          <li>
            <span className="kv-label">Email</span>
            <span className="kv-value">{user?.email}</span>
          </li>
          <li>
            <span className="kv-label">Role</span>
            <span className="kv-value" style={{ textTransform: "capitalize" }}>
              {user?.role?.replace("_", " ")}
            </span>
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>About this page</h2>
        <p className="state-msg">
          Editing profile details isn't wired up yet — this currently shows
          what's on file from login. Worth flagging with the team whether
          profile editing is in scope for this capstone or a nice-to-have.
        </p>
      </section>
    </DashboardLayout>
  );
}
