export function TxControls({ disabled, onSupply, onBorrow, onRepay, logMessage }) {
  async function handleSubmit(event, handler) {
    event.preventDefault();
    const form = event.target;
    const amount = Number(new FormData(form).get('amount'));
    handler(amount);
    form.reset();
  }
  return (
    <div className="panel">
      <h2>Supply / Borrow Controls</h2>
      <div className="muted">Amounts denominated in reserve token</div>
      <form onSubmit={(e) => handleSubmit(e, onSupply)}>
        <label>Amount <input name="amount" type="number" min="0" step="1" required /></label>
        <button type="submit" disabled={disabled}>Supply</button>
      </form>
      <form onSubmit={(e) => handleSubmit(e, onBorrow)}>
        <label>Amount <input name="amount" type="number" min="0" step="1" required /></label>
        <button type="submit" disabled={disabled}>Borrow</button>
      </form>
      <form onSubmit={(e) => handleSubmit(e, onRepay)}>
        <label>Amount <input name="amount" type="number" min="0" step="1" required /></label>
        <button type="submit" disabled={disabled}>Repay</button>
      </form>
      <div className="log">{logMessage}</div>
    </div>
  );
}
