export function MetricCard({ label, value }) {
  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <div className="muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
