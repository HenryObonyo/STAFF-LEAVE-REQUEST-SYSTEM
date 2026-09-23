// Renders a colored pill for a leave request's status.
// Keeping this in one place means the pending/approved/rejected colors
// stay consistent everywhere they show up.
export default function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`status-badge ${status}`}>{label}</span>;
}
