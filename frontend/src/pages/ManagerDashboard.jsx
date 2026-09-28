import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import {
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getMyLeaveRequests,
  createLeaveRequest,
  getLeaveTypes,
  getEmployeeLeaveHistory,
} from "../api/client";

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [actingOnId, setActingOnId] = useState(null);


  const [myRequests, setMyRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [employeeHistory, setEmployeeHistory] = useState([]);

  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

 async function loadRequests() {
  setStatus("loading");

  try {
    const [pendingData, historyData] = await Promise.all([
      getPendingLeaveRequests(),
      getEmployeeLeaveHistory(),
    ]);

    console.log(
      "MANAGER PENDING DATA:",
      JSON.stringify(pendingData, null, 2)
    );

    console.log(
      "MANAGER EMPLOYEE HISTORY:",
      JSON.stringify(historyData, null, 2)
    );

    setRequests(pendingData);
    setEmployeeHistory(historyData);

    setStatus("ready");
  } catch (err) {
    setErrorMsg(err.message);
    setStatus("error");
  }
}

  async function loadMyLeaveData() {
    try {
      const [myData, types] = await Promise.all([
        getMyLeaveRequests(),
        getLeaveTypes(),
      ]);

      setMyRequests(myData.leaveRequests || myData);
      setLeaveTypes(types.leaveTypes || types);
    } catch (err) {
      setFormError(err.message);
    }
  }



  useEffect(() => {
    loadRequests();
    loadMyLeaveData();
  }, []);


  async function handleSubmitLeave(e) {
    e.preventDefault();

    setFormStatus("");
    setFormError("");

    try {
      await createLeaveRequest({
        leave_type_id: Number(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason.trim(),
      });

      setFormStatus("Leave request submitted successfully.");

      setFormData({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      await loadMyLeaveData();
    } catch (err) {
      setFormError(err.message);
    }
  }





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
    const reason = window.prompt(
      "Enter the reason for rejecting this leave request:"
    );

    if (!reason || !reason.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    setActingOnId(id);

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
    <DashboardLayout title="Manager Dashboard">
      <section className="panel">
        <h2>Apply Your Leave</h2>

        {formError && (
          <p className="state-msg error">{formError}</p>
        )}

        {formStatus && (
          <p className="state-msg">{formStatus}</p>
        )}

        <form
          onSubmit={handleSubmitLeave}
          className="leave-form"
        >
          <div className="form-group">
            <label htmlFor="manager_leave_type">
              Leave Type
            </label>

            <select
              id="manager_leave_type"
              value={formData.leave_type_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  leave_type_id: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select leave type
              </option>

              {leaveTypes.map((type) => (
                <option
                  key={type.leave_type_id}
                  value={type.leave_type_id}
                >
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="manager_start_date">
              Start Date
            </label>

            <input
              id="manager_start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  start_date: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manager_end_date">
              End Date
            </label>

            <input
              id="manager_end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  end_date: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manager_reason">
              Reason
            </label>

            <textarea
              id="manager_reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reason: e.target.value,
                })
              }
              placeholder="Enter the reason for your leave request"
              required
            />
          </div>

          <button type="submit">
            Submit My Leave Request
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>My Leave Requests</h2>

        {myRequests.length === 0 ? (
          <p className="empty-state">
            You have not submitted any leave requests yet.
          </p>
        ) : (
          <table className="req-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Decision Reason</th>
                <th>Decided By</th>
              </tr>
            </thead>

            <tbody>
              {myRequests.map((r) => (
                <tr key={r.leave_request_id}>
                  <td>
                    {r.leave_type || r.leave_type_id}
                  </td>

                  <td>
                    {r.start_date} → {r.end_date}
                  </td>

                  <td>{r.reason}</td>

                  <td>
                    <StatusBadge status={r.status} />
                  </td>

                  <td>
                    {r.decision_reason || "—"}
                  </td>
                  <td>
                    {r.decided_by_name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>


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
                <tr key={r.leave_request_id}>
                  <td>{r.employee_name}</td>
                  <td>{r.leave_type || r.leave_type_id}</td>
                  <td>{r.start_date} → {r.end_date}</td>
                  <td>{r.reason}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn-small approve"
                        onClick={() => handleApprove(r.leave_request_id)}
                        disabled={actingOnId === r.leave_request_id}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-small reject"
                        onClick={() => handleReject(r.leave_request_id)}
                        disabled={actingOnId === r.leave_request_id}
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


      <section className="panel">
  <h2>Employee Leave History</h2>

  {employeeHistory.length === 0 ? (
    <p className="empty-state">
      No employee leave requests found.
    </p>
  ) : (
    <table className="req-table">
      <thead>
        <tr>
          <th>Employee</th>
          <th>Leave Type</th>
          <th>Dates</th>
          <th>Reason</th>
          <th>Status</th>
          <th>Decision Reason</th>
          <th>Decided By</th>
        </tr>
      </thead>

      <tbody>
        {employeeHistory.map((r) => (
          <tr key={r.leave_request_id}>
            <td>{r.employee_name}</td>

            <td>
              {r.leave_type || r.leave_type_id}
            </td>

            <td>
              {r.start_date} → {r.end_date}
            </td>

            <td>{r.reason}</td>

            <td>
              <StatusBadge status={r.status} />
            </td>

            <td>
              {r.decision_reason || "—"}
            </td>

            <td>
              {r.decided_by_name || "—"}
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
