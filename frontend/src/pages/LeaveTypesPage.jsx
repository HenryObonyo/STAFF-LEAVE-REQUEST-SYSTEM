import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getLeaveTypes } from "../api/client";

export default function LeaveTypesPage() {
  const [types, setTypes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const data = await getLeaveTypes();
        setTypes(data);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Leave types">
      <section className="panel">
        <h2>Configured leave types</h2>
        <p className="state-msg" style={{ marginBottom: 16 }}>
          Managed from the database, not hard-coded — employees choose from
          this exact list when submitting a request.
        </p>
        {status === "loading" && <p className="state-msg">Loading…</p>}
        {status === "error" && <p className="state-msg error">{errorMsg}</p>}
        {status === "ready" && (
          <ul className="type-pill-list">
            {types.map((t) => (
              <li key={t.id} className="type-pill">{t.name}</li>
            ))}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
