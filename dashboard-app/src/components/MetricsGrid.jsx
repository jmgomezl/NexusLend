import { MetricCard } from './MetricCard.jsx';

export function MetricsGrid({ accounts, supplied, borrowed, healthStats }) {
  return (
    <div className="metrics-grid">
      <MetricCard label="Accounts" value={accounts} />
      <MetricCard label="Supplied" value={`${Number(supplied).toFixed(2)}`} />
      <MetricCard label="Borrowed" value={`${Number(borrowed).toFixed(2)}`} />
      <MetricCard label="Avg Health" value={healthStats?.average ?? '--'} />
    </div>
  );
}
