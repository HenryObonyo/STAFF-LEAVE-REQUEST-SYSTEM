import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { getAllLeaveRequests } from "../api/client";

export default function AllLeaveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadRequests() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const data = await getAllLeaveRequests();

        setRequests(data);
        setStatus("ready");
      } catch (error) {
        setErrorMsg(error.message);
        setStatus("error");
      }
    }

    loadRequests();
  }, []);

  return (
    <DashboardLayout title="All Leave Requests">
      <section className="panel">
        <h2>All Leave Requests</h2>

        {status === "loading" && (
          <p className="state-msg">Loading leave requests...</p>
        )}

        {status === "error" && (
          <p className="state-msg error">{errorMsg}</p>
        )}

        {status === "ready" && (
          <>
            {requests.length === 0 ? (
              <p className="empty-state">
                No leave requests in the system yet.
              </p>
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
                  {requests.map((request) => (
                    <tr key={request.leave_request_id}>
                      <td>{request.employee_name}</td>

                      <td>{request.leave_type}</td>

                      <td>
                        {request.start_date} → {request.end_date}
                      </td>

                      <td>
                        <StatusBadge status={request.status} />
                      </td>

                      <td>
                        {request.decided_by_name || "—"}
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