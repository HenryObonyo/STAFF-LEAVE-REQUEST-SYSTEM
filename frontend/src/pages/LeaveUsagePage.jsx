import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getMyLeaveRequests, getLeaveTypes } from "../api/client";

// Counts days used per leave type from the employee's own approved requests.
// Note: this shows USAGE, not a remaining balance — the system has no
// concept of an annual allowance/entitlement yet, so we only show what's
// verifiably true from the data that exists rather than inventing numbers.
function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export default function LeaveUsagePage() {
  const [usageByType, setUsageByType] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const [requests, types] = await Promise.all([
          getMyLeaveRequests(),
          getLeaveTypes(),
        ]);

        const approved = requests.filter((r) => r.status === "approved");

        const rows = types.map((type) => {
          const forType = approved.filter((r) => r.leave_type_id === type.id);
          const daysUsed = forType.reduce(
            (sum, r) => sum + daysBetween(r.start_date, r.end_date),
            0
          );
          return { ...type, daysUsed, timesTaken: forType.length };
        });

        setUsageByType(rows);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Leave usage this year">
      <section className="panel">
        <h2>Days used, by type</h2>
        <p className="state-msg" style={{ marginBottom: 16 }}>
          Based on your approved requests. This shows what you've used, not a
          fixed annual balance — talk to HR about your specific entitlement.
        </p>

        {status === "loading" && <p className="state-msg">Loading…</p>}
        {status === "error" && <p className="state-msg error">{errorMsg}</p>}

        {status === "ready" && (
          <table className="req-table">
            <thead>
              <tr>
                <th>Leave type</th>
                <th>Times taken</th>
                <th>Days used</th>
              </tr>
            </thead>
            <tbody>
              {usageByType.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.timesTaken}</td>
                  <td>{row.daysUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
