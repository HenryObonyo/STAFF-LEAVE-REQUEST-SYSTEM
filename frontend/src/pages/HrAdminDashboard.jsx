import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import {
  getAllEmployees,
  getAllDepartments,
  getAllLeaveRequests,
  getDashboardStats,
  approveManagerLeaveRequest,
  rejectManagerLeaveRequest,
  getAuditLogs,
  createEmployee,
  updateEmployeeStatus,
} from "../api/client";

export default function HrAdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    role: "Employee",
    department_id: "",
  });

  const [employeeMessage, setEmployeeMessage] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);



  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const [emp, departments, reqs, stats, logs] = await Promise.all([
          getAllEmployees(),
          getAllDepartments(),
          getAllLeaveRequests(),
          getDashboardStats(),
          getAuditLogs(),
        ]);

        setEmployees(emp);
        setDepartments(departments);
        setRequests(reqs);
        setStats(stats);
        setAuditLogs(logs || []);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }

    load();
  }, []);

  const pendingCount = requests.filter(
    (r) => r.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (r) => r.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (r) => r.status === "Rejected"
  ).length;


  const handleApproveManagerRequest = async (id) => {
    try {
      await approveManagerLeaveRequest(id);

      const updatedRequests = await getAllLeaveRequests();
      setRequests(updatedRequests);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRejectManagerRequest = async (id) => {
    const reason = window.prompt("Enter the reason for rejecting this leave request:");

    if (!reason || !reason.trim()) {
      return;
    }

    try {
      await rejectManagerLeaveRequest(id, reason.trim());

      const updatedRequests = await getAllLeaveRequests();
      setRequests(updatedRequests);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };





  const peakLeaveMonth = stats?.leaveByMonth?.reduce(
    (peak, current) =>
      Number(current.request_count) > Number(peak.request_count)
        ? current
        : peak,
    stats?.leaveByMonth?.[0]
  );

  const peakLeaveDepartment = stats?.leaveByDepartment?.reduce(
    (peak, current) =>
      Number(current.request_count) > Number(peak.request_count)
        ? current
        : peak,
    stats?.leaveByDepartment?.[0]
  );


  const workforcePlanningInsight =
    peakLeaveDepartment && peakLeaveMonth
      ? `The ${peakLeaveDepartment.department} department recorded the highest leave-request volume, while ${peakLeaveMonth.month} had the highest overall leave activity. HR can use these patterns to plan staffing coverage, shift allocation, and leave scheduling during high-demand periods.`
      : "Leave patterns are not yet sufficient to generate a workforce planning insight.";


  const handleCreateEmployee = async (e) => {
    e.preventDefault();

    setEmployeeMessage("");
    setEmployeeError("");
    setCreatedCredentials(null);
    setCreatingEmployee(true);

    try {
      const data = await createEmployee({
        name: employeeForm.name,
        email: employeeForm.email,
        role: employeeForm.role,
        department_id: Number(employeeForm.department_id),
      });

      setEmployeeMessage(data.message);

      setCreatedCredentials({
        email: data.user.email,
        defaultPassword: data.defaultPassword,
      });

      setTimeout(() => {
        setCreatedCredentials(null);
      }, 10000);


      const updatedEmployees = await getAllEmployees();
      setEmployees(updatedEmployees);

      setEmployeeForm({
        name: "",
        email: "",
        role: "Employee",
        department_id: "",
      });
    } catch (error) {
      setEmployeeError(error.message);
    } finally {
      setCreatingEmployee(false);
    }
  };

  const handleToggleEmployeeStatus = async (employee) => {
    try {
      const updatedUser = await updateEmployeeStatus(
        employee.user_id,
        !employee.is_active
      );

      setEmployees((currentEmployees) =>
        currentEmployees.map((emp) =>
          emp.user_id === updatedUser.user_id
            ? updatedUser
            : emp
        )
      );
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <DashboardLayout title="Company-wide overview">
      {status === "loading" && <p className="state-msg">Loading…</p>}

      {status === "error" && (
        <p className="state-msg error">{errorMsg}</p>
      )}

      {status === "ready" && (
        <>
          <section className="summary-cards">
            <div className="summary-card">
              <span className="summary-card__label">Employees</span>
              <span className="summary-card__value">
                {employees.length}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-card__label">Pending</span>
              <span className="summary-card__value">
                {pendingCount}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-card__label">Approved</span>
              <span className="summary-card__value">
                {approvedCount}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-card__label">Rejected</span>
              <span className="summary-card__value">
                {rejectedCount}
              </span>
            </div>
          </section>

          <section className="panel">
            <h2>Employee Management</h2>

            {employees.length === 0 ? (
              <p className="empty-state">
                No employees found.
              </p>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.user_id}>
                      <td>{employee.name}</td>

                      <td>{employee.email}</td>

                      <td>{employee.role}</td>

                      <td>
                        {employee.department || employee.department_id || "—"}
                      </td>

                      <td>
                        {employee.is_active ? "Active" : "Disabled"}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleEmployeeStatus(employee)
                          }
                        >
                          {employee.is_active
                            ? "Disable"
                            : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="panel">
            <h2>Create Employee Account</h2>

            <form onSubmit={handleCreateEmployee}>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter employee name"
                  required
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter employee email"
                  required
                />
              </div>

              <div>
                <label>Role</label>
                <select
                  value={employeeForm.role}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>

                <select
                  className="department-select"
                  style={{
                    color: "#222",
                    backgroundColor: "#9b0707",
                  }}
                  value={employeeForm.department_id}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      department_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value=""
                    style={{
                      color: "#222",
                      backgroundColor: "#078a12",
                    }}>Select Department</option>

                  {departments.map((department) => (
                    <option
                      key={department.department_id}
                      value={department.department_id}
                      style={{
                        color: "#a52121",
                        backgroundColor: "#e4e1e1",
                      }}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={creatingEmployee}>
                {creatingEmployee
                  ? "Creating..."
                  : "Create Employee"}
              </button>
            </form>



            {employeeError && (
              <p className="state-msg error">
                {employeeError}
              </p>
            )}

            {createdCredentials && (
              <div className="state-msg">
                <strong>Employee account created successfully.</strong>

                <p>
                  Email:{" "}
                  <strong>{createdCredentials.email}</strong>
                </p>

                <p>
                  Default Password:{" "}
                  <strong>{createdCredentials.defaultPassword}</strong>
                </p>

                <p>
                  Give these login credentials to the employee.
                </p>
              </div>
            )}
          </section>


          <section className="panel">
            <h2>Leave Analytics</h2>

            <div className="summary-cards">
              <div className="summary-card">
                <span className="summary-card__label">
                  Total Leave Requests
                </span>
                <span className="summary-card__value">
                  {stats?.totalRequests ?? 0}
                </span>
              </div>

              <div className="summary-card">
                <span className="summary-card__label">
                  Average Leave Duration
                </span>
                <span className="summary-card__value">
                  {stats?.averageLeaveDuration ?? 0} days
                </span>
              </div>

              <div className="summary-card">
                <span className="summary-card__label">
                  Approval Rate
                </span>
                <span className="summary-card__value">
                  {stats?.decisionRates?.approvalRate ?? 0}%
                </span>
              </div>

              <div className="summary-card">
                <span className="summary-card__label">
                  Rejection Rate
                </span>
                <span className="summary-card__value">
                  {stats?.decisionRates?.rejectionRate ?? 0}%
                </span>
              </div>
            </div>
          </section>


          <section className="panel">
            <h2>Leave by Type</h2>

            {stats?.leaveByType?.length === 0 ? (
              <p className="empty-state">No leave type data available.</p>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Number of Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.leaveByType?.map((item) => (
                    <tr key={item.leave_type}>
                      <td>{item.leave_type}</td>
                      <td>{item.request_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>


          <section className="panel">
            <h2>Leave by Department</h2>

            {peakLeaveDepartment && (
              <p className="state-msg">
                <strong>Highest leave-request volume:</strong>{" "}
                {peakLeaveDepartment.department} with{" "}
                {peakLeaveDepartment.request_count} leave requests.
              </p>
            )}


            {stats?.leaveByDepartment?.length === 0 ? (
              <p className="empty-state">
                No department data available.
              </p>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Number of Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.leaveByDepartment?.map((item) => (
                    <tr key={item.department}>
                      <td>{item.department}</td>
                      <td>{item.request_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="panel">
            <h2>Leave by Month</h2>
            {peakLeaveMonth && (
              <p className="state-msg">
                <strong>Peak leave period:</strong>{" "}
                {peakLeaveMonth.month} with{" "}
                {peakLeaveMonth.request_count} leave requests.
              </p>
            )}




            {stats?.leaveByMonth?.length === 0 ? (
              <p className="empty-state">
                No monthly leave data available.
              </p>
            ) : (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats?.leaveByMonth || []}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      allowDecimals={false}
                      label={{
                        value: "Number of Requests",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="request_count"
                      stroke="#2c2c6c"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Workforce Planning Insight</h2>

            <p className="state-msg">
              {workforcePlanningInsight}
            </p>
          </section>

          <section className="panel">
            <h2>Manager Leave Approvals</h2>

            {requests.filter(
              (r) =>
                r.status === "Pending" &&
                employees.find((e) => e.user_id === r.employee_id)?.role === "Manager"
            ).length === 0 ? (
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
                  {requests
                    .filter(
                      (r) =>
                        r.status === "Pending" &&
                        employees.find(
                          (e) => e.user_id === r.employee_id
                        )?.role === "Manager"
                    )
                    .map((r) => (
                      <tr key={r.leave_request_id}>
                        <td>{r.employee_name}</td>

                        <td>{r.leave_type}</td>

                        <td>
                          {r.start_date} → {r.end_date}
                        </td>

                        <td>{r.reason}</td>

                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() =>
                                handleApproveManagerRequest(
                                  r.leave_request_id
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleRejectManagerRequest(
                                  r.leave_request_id
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
          </section>



          <section className="panel">
            <h2>All leave requests</h2>

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
                  {requests.map((r) => (
                    <tr key={r.leave_request_id}>
                      <td>{r.employee_name}</td>
                      <td>{r.leave_type}</td>
                      <td>
                        {r.start_date} → {r.end_date}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>{r.decided_by_name || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>


          <section className="panel">
            <h2>Audit Logs</h2>

            {auditLogs.length === 0 ? (
              <p className="empty-state">
                No audit logs available.
              </p>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.audit_log_id}>
                      <td>{log.user_name || log.user_id || "—"}</td>
                      <td>{log.action || "—"}</td>
                      <td>{log.description || "—"}</td>
                      <td>
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString()
                          : "—"}
                      </td>
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