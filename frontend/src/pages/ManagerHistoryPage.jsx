import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { getTeamLeaveRequests } from "../api/client";

export default function ManagerHistoryPage() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const all = await getTeamLeaveRequests();
        const decided = all
          .filter((r) => r.status !== "pending")
          .sort((a, b) => new Date(b.decided_at) - new Date(a.decided_at));
        setRequests(decided);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Decision history">
      <section className="panel">
        <h2>Past approvals &amp; rejections</h2>
        {status === "loading" && <p className="state-msg">Loading…</p>}
        {status === "error" && <p className="state-msg error">{errorMsg}</p>}
        {status === "ready" && requests.length === 0 && (
          <p className="empty-state">No decisions made yet.</p>
        )}
        {status === "ready" && requests.length > 0 && (
          <table className="req-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Decided</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.employee_name}</td>
                  <td>{r.leave_type_name || r.leave_type_id}</td>
                  <td>{r.start_date} → {r.end_date}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.decided_at ? new Date(r.decided_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
