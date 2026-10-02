import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  getMyLeaveBalances
} from "../api/client";
import "./LeaveUsagePage.css";

// Calculate the number of calendar days between two dates.
function daysBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const ms = endDate - startDate;

  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export default function LeaveUsagePage() {
  const [usageByType, setUsageByType] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const data = await getMyLeaveBalances();

        const balances = Array.isArray(data)
          ? data
          : Array.isArray(data.balances)
            ? data.balances
            : [];

        setUsageByType(balances);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }

    load();
  }, []);


  return (
    <div className="leave-usage-page">
      <DashboardLayout title="Leave Usage">
        <section className="leave-usage-panel">
          <div className="leave-usage-header">
            <h2>Leave Usage</h2>

            <p>
              <p>
                View your leave entitlement, days used, and remaining
                leave balance for the current year.
              </p>
            </p>
          </div>

          <div className="leave-usage-notice">
            <strong>About your leave usage</strong>

            <p>
              <p>
                Your leave balance is calculated from your approved
                leave requests and your current annual entitlement.
              </p>
            </p>
          </div>

          {status === "loading" && (
            <p className="leave-usage-loading">
              Loading your leave usage...
            </p>
          )}

          {status === "error" && (
            <p className="leave-usage-error">
              {errorMsg}
            </p>
          )}

          {status === "ready" &&
            usageByType.length === 0 && (
              <p className="leave-usage-empty">
                No leave types are currently available.
              </p>
            )}

          {status === "ready" &&
            usageByType.length > 0 && (
              <div className="leave-usage-table-wrapper">
                <table className="leave-usage-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Entitled Days</th>
                      <th>Days Used</th>
                      <th>Remaining Days</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usageByType.map((row) => (
                      <tr key={row.leave_type_id}>
                        <td>{row.leave_type}</td>
                        <td>{row.entitled_days}</td>
                        <td>{row.days_used}</td>
                        <td>{row.remaining_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </DashboardLayout>
    </div>
  );
}