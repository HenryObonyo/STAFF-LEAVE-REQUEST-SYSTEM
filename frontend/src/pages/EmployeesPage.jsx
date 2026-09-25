import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getAllEmployees } from "../api/client";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const data = await getAllEmployees();
        setEmployees(data);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Employees">
      <section className="panel">
        <h2>All employees</h2>
        {status === "loading" && <p className="state-msg">Loading…</p>}
        {status === "error" && <p className="state-msg error">{errorMsg}</p>}
        {status === "ready" && employees.length === 0 && (
          <p className="empty-state">No employees found.</p>
        )}
        {status === "ready" && employees.length > 0 && (
          <table className="req-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
