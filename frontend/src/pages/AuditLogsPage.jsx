import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getAuditLogs } from "../api/client";

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadAuditLogs() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const data = await getAuditLogs();

        setAuditLogs(data || []);
        setStatus("ready");
      } catch (error) {
        setErrorMsg(error.message);
        setStatus("error");
      }
    }

    loadAuditLogs();
  }, []);

  return (
    <DashboardLayout title="Audit Logs">
      <section className="panel">
        <h2>System Audit Logs</h2>

        {status === "loading" && (
          <p className="state-msg">Loading audit logs...</p>
        )}

        {status === "error" && (
          <p className="state-msg error">{errorMsg}</p>
        )}

        {status === "ready" && (
          <>
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
                      <td>
                        {log.user_name || log.user_id || "—"}
                      </td>

                      <td>{log.action || "—"}</td>

                      <td>{log.description || "—"}</td>

                      <td>
                        {log.created_at
                          ? new Date(
                              log.created_at
                            ).toLocaleString()
                          : "—"}
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