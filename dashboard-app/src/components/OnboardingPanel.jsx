export function OnboardingPanel({ tokenSymbol }) {
  return (
    <div className="panel info-panel">
      <p className="eyebrow">Operator Checklist</p>
      <h2>Quick start</h2>
      <ol className="muted" style={{ lineHeight: 1.5, paddingLeft: '1.2rem' }}>
        <li>Connect HashPack (testnet) or paste your Hedera account ID.</li>
        <li>Associate token <code>0.0.7266311</code> and click <strong>Request KYC</strong>.</li>
        <li>Supply {tokenSymbol} as collateral, then borrow within the health limit.</li>
        <li>Monitor positions and open Hashscan links for on-chain history.</li>
      </ol>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        Contract: <a href="https://hashscan.io/testnet/contract/0.0.7266732" target="_blank" rel="noreferrer">0.0.7266732</a>
      </p>
    </div>
  );
}
