
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import {
  getMyLeaveRequests,
  createLeaveRequest,
  getLeaveTypes,
  updateLeaveRequest,
  deleteLeaveRequest,
} from "../api/client";

export default function EmployeeDashboard() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingRequest, setEditingRequest] = useState(null);

  async function loadData() {
    setStatus("loading");

    try {
      const [myRequests, types] = await Promise.all([
        getMyLeaveRequests(),
        getLeaveTypes(),
      ]);

      setRequests(myRequests.leaveRequests);
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
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (editingRequest) {
        await updateLeaveRequest(editingRequest.leave_request_id, form);
      } else {
        await createLeaveRequest(form);
      }

      setForm({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setEditingRequest(null);

      setSuccessMsg(
        editingRequest
          ? "Leave request updated successfully."
          : "Leave request submitted successfully."
      );

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

      await loadData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }


  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLeaveRequest(id);

      setSuccessMsg("Leave request deleted successfully.");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

      await loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  }




  return (
    <DashboardLayout title="Apply your leave here">

      {successMsg && (
        <div className="success-popup">
          {successMsg}
        </div>
      )}

      {errorMsg && status !== "error" && (
        <div className="state-msg error">
          {errorMsg}
        </div>
      )}

      <section className="panel">
        <h2>{editingRequest ? "Edit request" : "New request"}</h2>

        <form className="leave-form" onSubmit={handleSubmit}>
          <div className="leave-form__row">

            <div className="field">
              <label>Leave type</label>

              <select
                value={form.leave_type_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    leave_type_id: e.target.value,
                  })
                }
                required
              >
                <option value="" disabled>
                  Select type
                </option>

                {leaveTypes.map((t) => (
                  <option
                    key={t.leave_type_id}
                    value={t.leave_type_id}
                  >
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
                  setForm({
                    ...form,
                    start_date: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="field">
              <label>End date</label>

              <input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    end_date: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Reason</label>

            <textarea
              rows={2}
              value={form.reason}
              onChange={(e) =>
                setForm({
                  ...form,
                  reason: e.target.value,
                })
              }
              placeholder="Briefly explain the reason for this request"
              required
            />
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : editingRequest
                ? "Update request"
                : "Submit request"}
          </button>

          {editingRequest && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingRequest(null);

                setForm({
                  leave_type_id: "",
                  start_date: "",
                  end_date: "",
                  reason: "",
                });
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>History</h2>

        {status === "loading" && (
          <p className="state-msg">Loading…</p>
        )}

        {status === "error" && (
          <p className="state-msg error">
            {errorMsg}
          </p>
        )}

        {status === "ready" && requests.length === 0 && (
          <p className="empty-state">
            You haven't submitted any leave requests yet.
          </p>
        )}

        {status === "ready" && requests.length > 0 && (
          <table className="req-table">

            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Decision</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.leave_request_id}>

                  <td>{r.leave_type}</td>

                  <td>
                    {r.start_date?.split("T")[0]} →{" "}
                    {r.end_date?.split("T")[0]}
                  </td>

                  <td>{r.reason}</td>

                  <td>
                    {r.status === "Rejected" ? (
                      <span>
                        {r.decision_reason ||
                          "No rejection reason provided"}
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

                  <td>
                    {r.status === "Pending" && (
                      <td>
                        <div className="row-actions">
                          {r.status === "Pending" && (
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => {
                                setEditingRequest(r);

                                setForm({
                                  leave_type_id: r.leave_type_id,
                                  start_date: r.start_date.split("T")[0],
                                  end_date: r.end_date.split("T")[0],
                                  reason: r.reason,
                                });
                              }}
                            >
                              Edit
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-small reject"
                            onClick={() => handleDelete(r.leave_request_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
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
