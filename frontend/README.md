# Staff Leave Request System — Frontend

React + Vite frontend for the Staff Leave Request System, built for the simulated client **AFRICA CONSULTIQ**.

 Structure

```text
src/
├── api/client.js            # Every backend call lives here. Matches the endpoint
│                              contract agreed with the backend team — see below.
├── context/AuthContext.jsx   # Login state, current user, logout
├── components/
│   ├── ProtectedRoute.jsx    # Blocks a page unless logged in + correct role
│   ├── DashboardLayout.jsx   # Shared sidebar + header for all three dashboards
│   └── StatusBadge.jsx       # Pending / Approved / Rejected pill
├── pages/
│   ├── LoginPage.jsx
│   ├── EmployeeDashboard.jsx    # Submit + view own requests
│   ├── ManagerDashboard.jsx     # Approve/reject team's pending requests
│   └── HrAdminDashboard.jsx     # Company-wide view + summary stats
├── styles/                   # Plain CSS, no framework — tokens.css holds the palette
└── App.jsx                   # Routes + role-based redirects
```

 Running it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

 Connecting to the backend

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to wherever the backend runs
   (currently `http://localhost:5000/api`).
2. `src/api/client.js` is the single source of truth for every API call the frontend
   makes. If a backend route's path, method, or response shape changes, update it here.
3. Expected login response shape:

   ```json
   { "token": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "employee" } }
   ```

   `role` must be exactly `"employee"`, `"manager"`, or `"hr_admin"`.

 What's already handled

- Role-based routing (an employee can't reach `/manager` or `/hr`, even by typing the URL)
- Login, logout, session persistence
- All three dashboards wired to call the API and render real data
- Rejecting a request requires a reason before it submits (matches BR-10)

 What's still to build

- Registration page (FR-01 — self-registration is in scope per the functional requirements)
- Public landing page ahead of the login screen
- Final color/branding pass
