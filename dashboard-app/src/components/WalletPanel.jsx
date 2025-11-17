import { useState } from 'react';

export function WalletPanel({ accountId, status, onManualChange, onConnect, onRequestKyc, logMessage }) {
  return (
    <div className="panel">
      <div className="brand">
        <div className="brand-logo">NX</div>
        <div>
          <h1>NexusLend</h1>
          <p className="tagline">Hedera-native borrow/lend hub</p>
        </div>
      </div>
      <p className="muted">Status: {status}</p>
      <p>
        Connected account: <strong>{accountId || 'Not connected'}</strong>
      </p>
      <label className="muted">
        Manual account override
        <input placeholder="0.0.xxxxxx" onChange={(e) => onManualChange(e.target.value.trim())} />
      </label>
      <p className="muted">
        Associate token <code>0.0.7266311</code> in HashPack, then request KYC to unlock borrowing.
      </p>
      <div className="actions">
        <button onClick={onConnect}>Connect HashPack</button>
        <button onClick={onRequestKyc} disabled={!accountId} style={{ background: 'rgba(148, 163, 184, 0.2)' }}>
          Request KYC
        </button>
      </div>
      <div className="log">{logMessage}</div>
    </div>
  );
}
