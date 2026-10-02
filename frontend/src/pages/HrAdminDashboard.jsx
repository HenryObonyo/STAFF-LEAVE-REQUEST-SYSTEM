
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
import "./HrAdminDashboard.css";
import { getDashboardStats } from "../api/client";

export default function HrAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const data = await getDashboardStats();

        setStats(data);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }

    load();
  }, []);

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

  return (
    <DashboardLayout title="Company-wide overview">
      <div className="hr-overview">
      {status === "loading" && (
        <p className="state-msg">Loading...</p>
      )}

      {status === "error" && (
        <p className="state-msg error">{errorMsg}</p>
      )}

      {status === "ready" && (
        <>
          {/* Company Summary */}
          <section className="summary-cards">
            <div className="summary-card">
              <span className="summary-card__label">
                Employees
              </span>

              <span className="summary-card__value">
                {stats?.totalEmployees ?? 0}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-card__label">
                Pending
              </span>

              <span className="summary-card__value">
                {stats?.pendingRequests ?? 0}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-card__label">
                Approved
              </span>

              <span className="summary-card__value">
                {stats?.approvedRequests ?? 0}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-card__label">
                Rejected
              </span>

              <span className="summary-card__value">
                {stats?.rejectedRequests ?? 0}
              </span>
            </div>
          </section>

          {/* Leave Analytics */}
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

  {/* Leave by Month */}
          <section className="panel leave-month-panel">
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
                    <CartesianGrid
                      stroke="#dbeafe"
                      strokeDasharray="5 5"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#0439c9",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                      axisLine={{
                        stroke: "#060af0",
                      }}
                      tickLine={{
                        stroke: "#93c5fd",
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#df0c4c",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                      axisLine={{
                        stroke: "#1507e0",
                      }}
                      tickLine={{
                        stroke: "#9ea4f3",
                      }}
                      label={{
                        value: "Number of Requests",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#1e3a8a",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e90ab9",
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                      }}
                      labelStyle={{
                        color: "#df08df",
                        fontWeight: 700,
                      }}
                      itemStyle={{
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="request_count"
                      stroke="#1ee20d"
                      strokeWidth={4}
                      dot={{
                        r: 6,
                        fill: "#ffffff",
                        stroke: "#2532eb",
                        strokeWidth: 3,
                      }}
                      activeDot={{
                        r: 9,
                        fill: "#ff0000",
                        stroke: "#ffffff",
                        strokeWidth: 3,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Workforce Planning Insight */}
          <section className="panel workforce-insight-panel">
            <h2>Workforce Planning Insight</h2>

            <p className="state-msg">
              {workforcePlanningInsight}
            </p>
          </section>



          {/* Leave by Type */}
          <section className="panel leave-type-panel">
            <h2>Leave by Type</h2>

            {stats?.leaveByType?.length === 0 ? (
              <p className="empty-state">
                No leave type data available.
              </p>
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

          {/* Leave by Department */}
          <section className="panel leave-department-panel">
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

        
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
