import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./ManagerDashboard.css";
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
    setErrorMsg("");

    try {
      const data = await getPendingLeaveRequests();

      setRequests(data || []);
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
    setErrorMsg("");

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
    const reason = window.prompt(
      "Enter the reason for rejecting this leave request:"
    );

    if (!reason || !reason.trim()) {
      return;
    }

    setActingOnId(id);
    setErrorMsg("");

    try {
      await rejectLeaveRequest(id, reason.trim());
      await loadRequests();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActingOnId(null);
    }
  }

  return (
    <DashboardLayout title="Team Requests">
      <section className="panel">

        <div className="manager-requests-header">
          <div>
            <h2 className="manager-requests-title">
              Pending Approvals
            </h2>

            <p className="manager-requests-description">
              Review leave requests submitted by your team.
            </p>
          </div>

          <span className="manager-pending-count">
            {requests.length} Pending
          </span>
        </div>

        {status === "loading" && (
          <p className="state-msg">Loading team requests…</p>
        )}

        {status === "error" && (
          <p className="state-msg error">{errorMsg}</p>
        )}

        {status === "ready" && requests.length === 0 && (
          <p className="empty-state">
            There are no pending leave requests from your team.
          </p>
        )}

        {status === "ready" && requests.length > 0 && (
          <table className="req-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.leave_request_id}>
                  <td>{request.employee_name}</td>

                  <td>
                    {request.leave_type ||
                      request.leave_type_id}
                  </td>

                  <td>
                    {request.start_date} → {request.end_date}
                  </td>

                  <td>{request.reason}</td>

                  <td>
                    <StatusBadge status={request.status} />
                  </td>

                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn-small approve"
                        onClick={() =>
                          handleApprove(
                            request.leave_request_id
                          )
                        }
                        disabled={
                          actingOnId ===
                          request.leave_request_id
                        }
                      >
                        {actingOnId ===
                          request.leave_request_id
                          ? "Processing…"
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        className="btn-small reject"
                        onClick={() =>
                          handleReject(
                            request.leave_request_id
                          )
                        }
                        disabled={
                          actingOnId ===
                          request.leave_request_id
                        }
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