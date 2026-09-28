const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(
  path,
  { method = "GET", body, auth = true } = {}
) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.message || `Request failed (${res.status})`;

    throw new Error(message);
  }

  return data;
}


// --- Authentication ---

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}


// --- Employee Leave Requests ---

export function createLeaveRequest(payload) {
  return request("/leave-requests", {
    method: "POST",
    body: payload,
  });
}

export async function getMyLeaveRequests() {
  const data = await request("/leave-requests/my");
  return data;
}

export function updateLeaveRequest(id, payload) {
  return request(`/leave-requests/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteLeaveRequest(id) {
  return request(`/leave-requests/${id}`, {
    method: "DELETE",
  });
}


// --- Manager ---

export async function getPendingLeaveRequests() {
  const data = await request("/manager/pending");
  return data.leaveRequests;
}

export function approveLeaveRequest(id) {
  return request(`/manager/requests/${id}/approve`, {
    method: "PUT",
  });
}

export function rejectLeaveRequest(id, reason) {
  return request(`/manager/requests/${id}/reject`, {
    method: "PUT",
    body: {
      decision_reason: reason,
    },
  });
}

export async function getEmployeeLeaveHistory() {
  const data = await request("/manager/employee-history");
  return data.leaveRequests;
}


// --- HR / Admin ---

export async function getAllEmployees() {
  const data = await request("/admin/employees");
  return data.employees;
}

export async function getAllDepartments() {
  const data = await request("/admin/departments");
  return data.departments;
}

export async function createEmployee(employeeData) {
  const data = await request("/admin/employees", {
    method: "POST",
    body: employeeData,
  });

  return data;
}

export async function updateEmployeeStatus(userId, isActive) {
  const data = await request(`/admin/employees/${userId}/status`, {
    method: "PUT",
    body: {
      is_active: isActive,
    },
  });

  return data.user;
}

export async function getAuditLogs() {
  const data = await request("/admin/audit-logs");
  return data.auditLogs;
}

export async function getAllLeaveRequests() {
  const data = await request("/admin/leave-requests");
  return data.leaveRequests;
}

export async function getDashboardStats() {
  const data = await request("/admin/dashboard");
  return data.statistics;
}

export async function approveManagerLeaveRequest(id) {
  const data = await request(
    `/admin/manager-requests/${id}/approve`,
    {
      method: "PUT",
    }
  );

  return data.leaveRequest;
}

export async function rejectManagerLeaveRequest(
  id,
  decision_reason
) {
  const data = await request(
    `/admin/manager-requests/${id}/reject`,
    {
      method: "PUT",
      body: {
        decision_reason,
      },
    }
  );

  return data.leaveRequest;
}


// --- Reference Data ---

export function getLeaveTypes() {
  return request("/leave-types", {
    auth: false,
  });
}