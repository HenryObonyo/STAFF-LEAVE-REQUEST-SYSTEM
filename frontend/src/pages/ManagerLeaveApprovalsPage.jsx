import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./ManagerLeaveApprovalsPage.css";
import {
  getAllEmployees,
  getAllLeaveRequests,
  approveManagerLeaveRequest,
  rejectManagerLeaveRequest,
} from "../api/client";

export default function ManagerLeaveApprovalsPage() {
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const [employeeData, requestData] = await Promise.all([
          getAllEmployees(),
          getAllLeaveRequests(),
        ]);

        setEmployees(employeeData);
        setRequests(requestData);
        setStatus("ready");
      } catch (error) {
        setErrorMsg(error.message);
        setStatus("error");
      }
    }

    load();
  }, []);

  const managerPendingRequests = requests.filter(
    (request) =>
      request.status === "Pending" &&
      employees.find(
        (employee) => employee.user_id === request.employee_id
      )?.role === "Manager"
  );

  const handleApprove = async (id) => {
    try {
      await approveManagerLeaveRequest(id);

      const updatedRequests = await getAllLeaveRequests();
      setRequests(updatedRequests);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt(
      "Enter the reason for rejecting this leave request:"
    );

    if (!reason || !reason.trim()) {
      return;
    }

    try {
      await rejectManagerLeaveRequest(id, reason.trim());

      const updatedRequests = await getAllLeaveRequests();
      setRequests(updatedRequests);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <DashboardLayout title="Manager Leave Approvals">
      <section className="panel manager-approvals-panel">
        <h2>Pending Manager Leave Requests</h2>

        {status === "loading" && (
          <p className="state-msg">Loading...</p>
        )}

        {status === "error" && (
          <p className="state-msg error">{errorMsg}</p>
        )}

        {status === "ready" && (
          <>
            {managerPendingRequests.length === 0 ? (
              <p className="empty-state">
                No pending manager leave requests.
              </p>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Manager</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {managerPendingRequests.map((request) => (
                    <tr key={request.leave_request_id}>
                      <td>{request.employee_name}</td>

                      <td>{request.leave_type}</td>

                      <td>
                        {request.start_date} → {request.end_date}
                      </td>

                      <td>{request.reason}</td>

                      <td>
                        <div className="manager-action-buttons">
                          <button
                            type="button"
                            className="manager-approve-button"
                            onClick={() =>
                              handleApprove(
                                request.leave_request_id
                              )
                            }
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            className="manager-reject-button"
                            onClick={() =>
                              handleReject(
                                request.leave_request_id
                              )
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
          </>
        )}
      </section>
    </DashboardLayout>
  );
}