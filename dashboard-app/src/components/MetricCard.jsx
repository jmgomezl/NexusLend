export function MetricCard({ label, value, subtext }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {subtext ? <p className="metric-subtext">{subtext}</p> : null}
    </div>
  );
}
