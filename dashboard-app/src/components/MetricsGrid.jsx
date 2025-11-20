import { MetricCard } from './MetricCard.jsx';

function formatNumber(value, options = {}) {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) {
    return options.fallback ?? '--';
  }
  const formatOptions = { maximumFractionDigits: 2, ...options };
  return number.toLocaleString('en-US', formatOptions);
}

export function MetricsGrid({ accounts, supplied, borrowed, healthStats }) {
  const items = [
    {
      label: 'Active Accounts',
      value: formatNumber(accounts, { maximumFractionDigits: 0, fallback: '--' }),
      subtext: 'Wallets observed by monitor'
    },
    {
      label: 'Total Supplied',
      value: formatNumber(supplied, { fallback: '--' }),
      subtext: 'Reserve tokens deposited'
    },
    {
      label: 'Total Borrowed',
      value: formatNumber(borrowed, { fallback: '--' }),
      subtext: 'Credit drawn from pool'
    },
    {
      label: 'Avg Health',
      value: healthStats?.average ?? '--',
      subtext: 'Aggregate health factor'
    }
  ];

  return (
    <div className="metrics-grid">
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </div>
  );
}
