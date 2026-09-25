
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function createLeaveRequest(payload) {
  return request("/leave-requests", { method: "POST", body: payload });
}

export function getMyLeaveRequests() {
  return request("/leave-requests/mine");
}

export function updateLeaveRequest(id, payload) {
  return request(`/leave-requests/${id}`, { method: "PATCH", body: payload });
}

export function getPendingLeaveRequests() {
  return request("/leave-requests/pending");
}

export function getTeamLeaveRequests() {
  return request("/leave-requests/team");
}

export function approveLeaveRequest(id) {
  return request(`/leave-requests/${id}/approve`, { method: "PATCH" });
}

export function rejectLeaveRequest(id, reason) {
  return request(`/leave-requests/${id}/reject`, {
    method: "PATCH",
    body: { reason },
  });
}

export function getAllEmployees() {
  return request("/employees");
}

export function getAllLeaveRequests() {
  return request("/leave-requests");
}

export function getLeaveTypes() {
  return request("/leave-types", { auth: false });
}