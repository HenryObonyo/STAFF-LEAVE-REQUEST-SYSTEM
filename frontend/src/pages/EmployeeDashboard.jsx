import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import {
  getMyLeaveRequests,
  createLeaveRequest,
  getLeaveTypes,
} from "../api/client";

export default function EmployeeDashboard() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setStatus("loading");
    try {
      const [myRequests, types] = await Promise.all([
        getMyLeaveRequests(),
        getLeaveTypes(),
      ]);
      setRequests(myRequests);
      setLeaveTypes(types);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createLeaveRequest(form);
      setForm({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
      await loadData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="My leave requests">
      <section className="panel">
        <h2>New request</h2>
        <form className="leave-form" onSubmit={handleSubmit}>
          <div className="leave-form__row">
            <div className="field">
              <label>Leave type</label>
              <select
                value={form.leave_type_id}
                onChange={(e) =>
                  setForm({ ...form, leave_type_id: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Select type
                </option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Start date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label>End date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Reason</label>
            <textarea
              rows={2}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Briefly explain the reason for this request"
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>History</h2>
        {status === "loading" && <p className="state-msg">Loading…</p>}
        {status === "error" && <p className="state-msg error">{errorMsg}</p>}
        {status === "ready" && requests.length === 0 && (
          <p className="empty-state">You haven't submitted any leave requests yet.</p>
        )}
        {status === "ready" && requests.length > 0 && (
          <table className="req-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.leave_type_name || r.leave_type_id}</td>
                  <td>{r.start_date} → {r.end_date}</td>
                  <td>{r.reason}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
