export function WalletPanel({
  accountId,
  status,
  walletInfo,
  onManualChange,
  onConnect,
  onRequestKyc,
  logMessage,
  pairingString
}) {
  const canPair = Boolean(pairingString);

  const openDeepLink = () => {
    if (!pairingString) return;
    const link = `hashpack://hashconnect?c=${encodeURIComponent(pairingString)}`;
    window.location.href = link;
  };

  const copyPairing = async () => {
    if (!pairingString || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(pairingString);
    } catch (error) {
      console.warn('Unable to copy pairing string', error);
    }
  };

  return (
    <article className="panel wallet-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Wallet & Access</p>
          <h2>Connect credentials</h2>
        </div>
      </div>
      <p className="muted">HashConnect status: {status}</p>
      <p>
        Connected account: <strong>{accountId || 'Not connected'}</strong>
      </p>
      <p className="muted">
        KYC: <strong>{walletInfo.kyc}</strong> · HBAR: <strong>{walletInfo.hbar}</strong> · Reserve: <strong>{walletInfo.reserve}</strong>
      </p>
      <label>
        <span>Manual override</span>
        <input placeholder="0.0.xxxxxx" onChange={(e) => onManualChange(e.target.value.trim())} />
      </label>
      <p className="helper">
        Associate token <code>0.0.7266311</code> in HashPack, then request KYC to unlock borrowing.
      </p>
      <div className="actions">
        <button onClick={onConnect}>Pair HashPack</button>
        <button onClick={onRequestKyc} disabled={!accountId} className="ghost">
          Request KYC
        </button>
      </div>
      {canPair ? (
        <div className="pairing-hint">
          <p className="muted">
            If the browser cannot reach HashPack automatically, copy the pairing code or open the HashPack deep link.
          </p>
          <div className="pairing-actions">
            <button onClick={copyPairing} className="ghost">
              Copy code
            </button>
            <button onClick={openDeepLink} className="ghost">
              Open HashPack
            </button>
          </div>
          <code className="pairing-string">{pairingString}</code>
        </div>
      ) : null}
      <div className="log log-box">{logMessage}</div>
    </article>
  );
}
