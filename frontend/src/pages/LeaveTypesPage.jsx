import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./LeaveTypesPage.css";
import {
  getAllLeaveTypes,
  createLeaveType,
  deleteLeaveType,
} from "../api/client";

export default function LeaveTypesPage() {
  const [types, setTypes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const [leaveTypeName, setLeaveTypeName] = useState("");
  const [leaveTypeDescription, setLeaveTypeDescription] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);


  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const data = await getAllLeaveTypes();
        setTypes(data);
        setStatus("ready");
      } catch (err) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    load();
  }, []);



async function handleCreateLeaveType(event) {
  event.preventDefault();

  setErrorMsg("");
  setSuccessMsg("");

  const trimmedName = leaveTypeName.trim();
  const trimmedDescription = leaveTypeDescription.trim();

  if (!trimmedName) {
    setErrorMsg("Leave type name is required.");
    return;
  }

  try {
    setCreating(true);

    await createLeaveType(
      trimmedName,
      trimmedDescription
    );

    setLeaveTypeName("");
    setLeaveTypeDescription("");

    setSuccessMsg("Leave type created successfully.");

    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);

    const data = await getAllLeaveTypes();
    setTypes(data);

  } catch (error) {
    setErrorMsg(error.message);
  } finally {
    setCreating(false);
  }
}
async function handleDeleteLeaveType(leaveTypeId, leaveTypeName) {
  const confirmed = window.confirm(
    `Are you sure you want to delete the "${leaveTypeName}" leave type?`
  );

  if (!confirmed) {
    return;
  }

  setErrorMsg("");
  setSuccessMsg("");

  try {
    setDeletingId(leaveTypeId);

    await deleteLeaveType(leaveTypeId);

    setSuccessMsg("Leave type deleted successfully.");

    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);

    const data = await getAllLeaveTypes();
    setTypes(data);

  } catch (error) {
    setErrorMsg(error.message);
  } finally {
    setDeletingId(null);
  }
}

 return (
  <DashboardLayout title="Leave types">
    <section className="panel leave-types-page">
      <h2>Leave Types</h2>

      <form
        onSubmit={handleCreateLeaveType}
        className="leave-type-form"
      >
        <input
          type="text"
          value={leaveTypeName}
          onChange={(event) =>
            setLeaveTypeName(event.target.value)
          }
          placeholder="Enter leave type name"
          disabled={creating}
        />

        <input
          type="text"
          value={leaveTypeDescription}
          onChange={(event) =>
            setLeaveTypeDescription(event.target.value)
          }
          placeholder="Enter leave type description"
          disabled={creating}
        />

        <button
          type="submit"
          disabled={creating}
        >
          {creating ? "Adding..." : "Add Leave Type"}
        </button>
      </form>

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

      <p className="state-msg leave-type-info">
        These are the leave types configured in the system.
      </p>

      {status === "loading" && (
        <p className="state-msg">
          Loading leave types...
        </p>
      )}

      {status === "error" && (
        <p className="state-msg error">
          {errorMsg}
        </p>
      )}

      {status === "ready" && (
        <>
          {types.length === 0 ? (
            <p className="empty-state">
              No leave types found.
            </p>
          ) : (
            <table className="leave-types-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Leave Type</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {types.map((type) => (
                  <tr key={type.leave_type_id}>
                    <td>{type.leave_type_id}</td>

                    <td>
                      <strong>{type.name}</strong>
                    </td>

                    <td>
                      {type.description || "No description"}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteLeaveType(
                            type.leave_type_id,
                            type.name
                          )
                        }
                        disabled={
                          deletingId === type.leave_type_id
                        }
                        className="delete-leave-type-btn"
                      >
                        {deletingId === type.leave_type_id
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
