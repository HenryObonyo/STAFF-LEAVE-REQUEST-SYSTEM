
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./EmployeePages.css";
import {
  getAllEmployees,
  getAllDepartments,
  createEmployee,
  updateEmployeeStatus,
} from "../api/client";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

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

  async function loadData() {
    setStatus("loading");
    setErrorMsg("");

    try {
      const [emp, deps] = await Promise.all([
        getAllEmployees(),
        getAllDepartments(),
      ]);

      setEmployees(emp);
      setDepartments(deps);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateEmployee(e) {
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

      setEmployeeForm({
        name: "",
        email: "",
        role: "Employee",
        department_id: "",
      });

      const updatedEmployees = await getAllEmployees();
      setEmployees(updatedEmployees);

      setTimeout(() => {
        setCreatedCredentials(null);
      }, 10000);
    } catch (error) {
      setEmployeeError(error.message);
    } finally {
      setCreatingEmployee(false);
    }
  }

  async function handleToggleEmployeeStatus(employee) {
    try {
      const updatedUser = await updateEmployeeStatus(
        employee.user_id,
        !employee.is_active
      );

      setEmployees((currentEmployees) =>
        currentEmployees.map((emp) =>
          emp.user_id === updatedUser.user_id ? updatedUser : emp
        )
      );
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  return (
    <DashboardLayout title="Employee Management">
      <div className="employee-management">

        {status === "loading" && (
          <p className="state-msg">Loading employees...</p>
        )}

        {status === "error" && (
          <p className="state-msg error">{errorMsg}</p>
        )}

        {status === "ready" && (
          <>

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
                    <option value="Employee">
                      Employee
                    </option>

                    <option value="Manager">
                      Manager
                    </option>
                  </select>
                </div>

                <div>
                  <label>Department</label>

                  <select
                    value={employeeForm.department_id}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        department_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.department_id}
                        value={department.department_id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creatingEmployee}
                >
                  {creatingEmployee
                    ? "Creating..."
                    : "Create Employee"}
                </button>
              </form>

              {employeeMessage && (
                <p className="state-msg">
                  {employeeMessage}
                </p>
              )}

              {employeeError && (
                <p className="state-msg error">
                  {employeeError}
                </p>
              )}

              {createdCredentials && (
                <div className="state-msg">
                  <strong>
                    Employee account created successfully.
                  </strong>

                  <p>
                    Email:{" "}
                    <strong>
                      {createdCredentials.email}
                    </strong>
                  </p>

                  <p>
                    Default Password:{" "}
                    <strong>
                      {createdCredentials.defaultPassword}
                    </strong>
                  </p>

                  <p>
                    Give these login credentials to the employee.
                  </p>
                </div>
              )}
            </section>





            <section className="panel">
              <h2>Employees</h2>

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
                      <tr
                        key={employee.user_id}
                        className={
                          employee.role === "Manager"
                            ? "manager-row"
                            : "employee-row"
                        }
                      >
                        <td>{employee.name}</td>

                        <td>{employee.email}</td>

                        <td>{employee.role}</td>

                        <td>
                          {employee.department ||
                            employee.department_id ||
                            "—"}
                        </td>

                        <td>
                          {employee.is_active
                            ? "Active"
                            : "Disabled"}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
