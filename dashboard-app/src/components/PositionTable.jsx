export function PositionTable({ positions }) {
  return (
    <div className="panel">
      <h2>Tracked Positions</h2>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Supplied</th>
            <th>Borrowed</th>
            <th>Health</th>
            <th>Explorer</th>
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
              const health = Number(pos.healthFactor);
              const risk = Number.isFinite(health) && health < 1.1;
              return (
                <tr key={pos.accountId} className={risk ? 'risk-row' : ''}>
                  <td>{pos.accountId}</td>
                  <td>{Number(pos.position.supplied).toFixed(2)}</td>
                  <td>{Number(pos.position.borrowed).toFixed(2)}</td>
                  <td>{Number.isFinite(health) ? health.toFixed(2) : '--'}</td>
                  <td>
                    <a
                      href={`https://hashscan.io/testnet/account/${pos.accountId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="muted"
                    >
                      View
                    </a>
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
