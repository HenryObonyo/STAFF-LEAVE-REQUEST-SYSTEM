import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getTeamLeaveRequests } from "../api/client";

// A simple "who's off, and when" list rather than a full calendar-grid widget —
// answers the actual question a manager has ("who's out this month") without
// the complexity of a real date-grid component for a 2-week build.
export default function TeamCalendarPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const all = await getTeamLeaveRequests();
        const today = new Date();
        const approved = all
          .filter((r) => r.status === "approved" && new Date(r.end_date) >= today)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        setUpcoming(approved);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Team calendar">
      <section className="panel">
        <h2>Who's off, and when</h2>
        {status === "loading" && <p className="state-msg">Loading…</p>}
        {status === "error" && <p className="state-msg error">{errorMsg}</p>}
        {status === "ready" && upcoming.length === 0 && (
          <p className="empty-state">No upcoming approved leave for your team.</p>
        )}
        {status === "ready" && upcoming.length > 0 && (
          <ul className="calendar-list">
            {upcoming.map((r) => (
              <li key={r.id}>
                <span className="calendar-list__name">{r.employee_name}</span>
                <span className="calendar-list__dates">
                  {r.start_date} → {r.end_date}
                </span>
                <span className="calendar-list__type">
                  {r.leave_type_name || r.leave_type_id}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
