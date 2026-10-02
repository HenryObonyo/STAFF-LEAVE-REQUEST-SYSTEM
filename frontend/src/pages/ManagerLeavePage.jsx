import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./ManagerLeavePage.css";
import StatusBadge from "../components/StatusBadge";
import {
  getMyLeaveRequests,
  createLeaveRequest,
  getLeaveTypes,
} from "../api/client";

export default function ManagerLeavePage() {
  const [myRequests, setMyRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  async function loadMyLeaveData() {
    setLoading(true);
    setFormError("");

    try {
      const [myData, types] = await Promise.all([
        getMyLeaveRequests(),
        getLeaveTypes(),
      ]);

      setMyRequests(myData.leaveRequests || myData);
      setLeaveTypes(types.leaveTypes || types);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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

      setTimeout(() => {
        setFormStatus("");
      }, 3000);

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

  return (
    <DashboardLayout title="My Leave Request">
      {/* Apply for leave */}
      <section className="panel">
        <h2>Apply for Leave</h2>

        {formError && (
          <p className="state-msg error">{formError}</p>
        )}

        {formStatus && (
          <p className="state-msg">{formStatus}</p>
        )}

        <form onSubmit={handleSubmitLeave} className="leave-form">
          <div className="leave-form__row">
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
              rows="4"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Submit Leave Request
          </button>
        </form>
      </section>

      {/* My leave history */}
      <section className="panel">
        <h2>My Leave Requests</h2>

        {loading && (
          <p className="state-msg">
            Loading your leave requests...
          </p>
        )}

        {!loading && myRequests.length === 0 && (
          <p className="empty-state">
            You have not submitted any leave requests yet.
          </p>
        )}

        {!loading && myRequests.length > 0 && (
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
              {myRequests.map((request) => (
                <tr key={request.leave_request_id}>
                  <td>
                    {request.leave_type ||
                      request.leave_type_id}
                  </td>

                  <td>
                    {request.start_date} →{" "}
                    {request.end_date}
                  </td>

                  <td>{request.reason}</td>

                  <td>
                    <StatusBadge
                      status={request.status}
                    />
                  </td>

                  <td>
                    {request.decision_reason || "—"}
                  </td>

                  <td>
                    {request.decided_by_name || "—"}
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