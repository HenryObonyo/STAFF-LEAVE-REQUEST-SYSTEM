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
          .filter((r) => r.status === "Approved" && new Date(r.end_date) >= today)
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
          <table className="req-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
              </tr>
            </thead>

            <tbody>
              {upcoming.map((r) => {
                const start = new Date(r.start_date);
                const end = new Date(r.end_date);

                const duration =
                  Math.ceil(
                    (end - start) / (1000 * 60 * 60 * 24)
                  ) + 1;

                return (
                  <tr key={r.leave_request_id}>
                    <td>{r.employee_name}</td>

                    <td>{r.leave_type}</td>

                    <td>
                      {start.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td>
                      {end.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td>
                      {duration} {duration === 1 ? "day" : "days"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
