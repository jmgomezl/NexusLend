function formatNumber(value) {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) return '--';
  return number.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function healthClass(value) {
  if (value >= 1.5) return 'good';
  if (value >= 1.1) return 'warn';
  return 'danger';
}

export function PositionTable({ positions }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Supplied</th>
            <th>Borrowed</th>
            <th>Health</th>
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted">
                No positions yet
              </td>
            </tr>
          ) : (
            positions.map((pos) => {
              const health = Number(pos.healthFactor ?? 0);
              const healthDisplay = Number.isFinite(health) ? health.toFixed(2) : '--';
              return (
                <tr key={pos.accountId}>
                  <td>
                    <div className="account-id">{pos.accountId}</div>
                    <div className="micro">Sampled by monitor</div>
                  </td>
                  <td>
                    <span className="amount">{formatNumber(pos.position?.supplied)}</span>
                  </td>
                  <td>
                    <span className="amount">{formatNumber(pos.position?.borrowed)}</span>
                  </td>
                  <td>
                    <span className={`pill ${healthClass(health)}`}>{healthDisplay}</span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
