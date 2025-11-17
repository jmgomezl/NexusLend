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
            positions.map((pos) => (
              <tr key={pos.accountId}>
                <td>{pos.accountId}</td>
                <td>{Number(pos.position.supplied).toFixed(2)}</td>
                <td>{Number(pos.position.borrowed).toFixed(2)}</td>
                <td>{Number(pos.healthFactor).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
