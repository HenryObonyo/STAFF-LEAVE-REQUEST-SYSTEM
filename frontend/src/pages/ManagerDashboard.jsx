import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import {
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../api/client";

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [actingOnId, setActingOnId] = useState(null);

  async function loadRequests() {
    setStatus("loading");
    try {
      const data = await getPendingLeaveRequests();
      setRequests(data);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleApprove(id) {
    setActingOnId(id);
    try {
      await approveLeaveRequest(id);
      await loadRequests();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActingOnId(null);
    }
  }

  async function handleReject(id) {
    const reason = window.prompt("Reason for rejecting this request:");
    if (!reason) return; // rejection requires a reason — don't submit an empty one
    setActingOnId(id);
    try {
      await rejectLeaveRequest(id, reason);
      await loadRequests();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActingOnId(null);
    }
  }

  return (
    <DashboardLayout title="Team requests awaiting review">
      <section className="panel">
        <h2>Pending approvals</h2>
        {status === "loading" && <p className="state-msg">Loading…</p>}
        {status === "error" && <p className="state-msg error">{errorMsg}</p>}
        {status === "ready" && requests.length === 0 && (
          <p className="empty-state">Nothing pending right now.</p>
        )}
        {status === "ready" && requests.length > 0 && (
          <table className="req-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.employee_name}</td>
                  <td>{r.leave_type_name || r.leave_type_id}</td>
                  <td>{r.start_date} → {r.end_date}</td>
                  <td>{r.reason}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn-small approve"
                        onClick={() => handleApprove(r.id)}
                        disabled={actingOnId === r.id}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-small reject"
                        onClick={() => handleReject(r.id)}
                        disabled={actingOnId === r.id}
                      >
                        Reject
                      </button>
                    </div>
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
