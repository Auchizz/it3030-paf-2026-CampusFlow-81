export default function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="small">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  )
}
