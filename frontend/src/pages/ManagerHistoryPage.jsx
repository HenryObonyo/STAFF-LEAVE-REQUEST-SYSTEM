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
        const sorted = [...all]
          .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
        setRequests(sorted);
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
                <th>Reason</th>
                <th>Decision</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.employee_name}</td>

                  <td>{r.leave_type}</td>

                  <td>
                    {r.start_date?.split("T")[0]} →{" "}
                    {r.end_date?.split("T")[0]}
                  </td>

                  <td>{r.reason}</td>

                  <td>
                    {r.status === "Rejected" ? (
                      <span>
                        {r.decision_reason || "No rejection reason provided"}
                      </span>
                    ) : r.status === "Approved" ? (
                      <span>Approved by manager</span>
                    ) : (
                      <span>Awaiting manager review</span>
                    )}
                  </td>

                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
