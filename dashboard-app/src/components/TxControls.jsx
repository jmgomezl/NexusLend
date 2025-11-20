export function TxControls({ disabled, onSupply, onBorrow, onRepay, logMessage, tokenSymbol }) {
  async function handleSubmit(event, handler) {
    event.preventDefault();
    const form = event.target;
    const amount = Number(new FormData(form).get('amount'));
    handler(amount);
    form.reset();
  }
  return (
    <>
      <div className="controls-grid">
        <div className="control-card">
          <h3>Supply assets</h3>
          <form onSubmit={(e) => handleSubmit(e, onSupply)}>
            <label>
              <span>Amount ({tokenSymbol})</span>
              <input name="amount" type="number" min="0" step="1" required />
            </label>
            <button type="submit" disabled={disabled}>
              Supply
            </button>
          </form>
        </div>
        <div className="control-card">
          <h3>Borrow liquidity</h3>
          <form onSubmit={(e) => handleSubmit(e, onBorrow)}>
            <label>
              <span>Amount ({tokenSymbol})</span>
              <input name="amount" type="number" min="0" step="1" required />
            </label>
            <button type="submit" disabled={disabled}>
              Borrow
            </button>
          </form>
        </div>
        <div className="control-card">
          <h3>Repay debt</h3>
          <form onSubmit={(e) => handleSubmit(e, onRepay)}>
            <label>
              <span>Amount ({tokenSymbol})</span>
              <input name="amount" type="number" min="0" step="1" required />
            </label>
            <button type="submit" disabled={disabled}>
              Repay
            </button>
          </form>
        </div>
      </div>
      <div className="log log-box">{logMessage}</div>
    </>
  );
}
