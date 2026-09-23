import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { getAllEmployees, getAllLeaveRequests } from "../api/client";

export default function HrAdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const [emp, reqs] = await Promise.all([
          getAllEmployees(),
          getAllLeaveRequests(),
        ]);
        setEmployees(emp);
        setRequests(reqs);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    load();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <DashboardLayout title="Company-wide overview">
      {status === "loading" && <p className="state-msg">Loading…</p>}
      {status === "error" && <p className="state-msg error">{errorMsg}</p>}

      {status === "ready" && (
        <>
          <section className="summary-cards">
            <div className="summary-card">
              <span className="summary-card__label">Employees</span>
              <span className="summary-card__value">{employees.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-card__label">Pending</span>
              <span className="summary-card__value">{pendingCount}</span>
            </div>
            <div className="summary-card">
              <span className="summary-card__label">Approved</span>
              <span className="summary-card__value">{approvedCount}</span>
            </div>
            <div className="summary-card">
              <span className="summary-card__label">Rejected</span>
              <span className="summary-card__value">{rejectedCount}</span>
            </div>
          </section>

          <section className="panel">
            <h2>All leave requests</h2>
            {requests.length === 0 ? (
              <p className="empty-state">No leave requests in the system yet.</p>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Decided by</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{r.employee_name}</td>
                      <td>{r.leave_type_name || r.leave_type_id}</td>
                      <td>{r.start_date} → {r.end_date}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>{r.decided_by_name || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
