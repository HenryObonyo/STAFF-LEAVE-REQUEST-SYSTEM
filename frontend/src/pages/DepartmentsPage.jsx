import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./DepartmentPages.css";
import {
  getAllDepartments,
  createDepartment,
  deleteDepartment,
} from "../api/client";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadDepartments() {
    setStatus("loading");
    setErrorMsg("");

    try {
      const data = await getAllDepartments();

      setDepartments(data);
      setStatus("ready");
    } catch (error) {
      setErrorMsg(error.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  async function handleCreateDepartment(event) {
    event.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    const trimmedName = departmentName.trim();

    if (!trimmedName) {
      setErrorMsg("Department name is required.");
      return;
    }

    const trimmedDescription = departmentDescription.trim();

    try {
      setCreating(true);

      await createDepartment(trimmedName, trimmedDescription);

      setDepartmentName("");
      setDepartmentDescription("");
      setSuccessMsg("Department created successfully.");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

      await loadDepartments();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteDepartment(departmentId, departmentName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the "${departmentName}" department?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    try {
      setDeletingId(departmentId);

      await deleteDepartment(departmentId);

      setSuccessMsg("Department deleted successfully.");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

      await loadDepartments();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardLayout title="Departments">
      <section className="panel departments-page">
        <h2>Departments</h2>

        {/* Add Department */}
        <form
          onSubmit={handleCreateDepartment}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
            placeholder="Enter department name"
            disabled={creating}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              minWidth: "260px",
              fontSize: "14px",
            }}
          />

          <input
            type="text"
            value={departmentDescription}
            onChange={(event) =>
              setDepartmentDescription(event.target.value)
            }
            placeholder="Enter department description"
            disabled={creating}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              minWidth: "320px",
              fontSize: "14px",
            }}
          />


          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: creating ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {creating ? "Adding..." : "Add Department"}
          </button>
        </form>

        {/* Messages */}
        {errorMsg && (
          <p className="state-msg error">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="state-msg">
            {successMsg}
          </p>
        )}

        {/* Loading */}
        {status === "loading" && (
          <p className="state-msg">
            Loading departments...
          </p>
        )}

        {/* Departments Table */}
        {status === "ready" && (
          <>
            {departments.length === 0 ? (
              <p className="empty-state">
                No departments found.
              </p>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Department ID</th>
                    <th>Department Name</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map((department) => (
                    <tr key={department.department_id}>
                      <td>{department.department_id}</td>

                      <td>{department.name}</td>

                      <td>
                        {department.description || "No description"}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteDepartment(
                              department.department_id,
                              department.name
                            )
                          }
                          disabled={
                            deletingId === department.department_id
                          }
                          style={{
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "5px",
                            cursor:
                              deletingId === department.department_id
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "600",
                          }}
                        >
                          {deletingId === department.department_id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
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