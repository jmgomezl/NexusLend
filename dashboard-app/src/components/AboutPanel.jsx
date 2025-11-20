export function AboutPanel({ tokenSymbol }) {
  return (
    <div className="panel">
      <h2>About NexusLend</h2>
      <p className="muted">
        NexusLend is a Hedera-native lending protocol that enforces HTS KYC before borrowers tap liquidity.
        Contract <a href="https://hashscan.io/testnet/contract/0.0.7266732" target="_blank" rel="noreferrer">0.0.7266732</a>
        tracks supply/borrow positions denominated in {tokenSymbol}.
      </p>
      <ul className="muted" style={{ lineHeight: 1.4 }}>
        <li>HTS token: <code>0.0.7266311</code> ({tokenSymbol})</li>
        <li>KYC gating via token relationships + mirror node</li>
        <li>Render-hosted API handles KYC grants / mirror lookups</li>
        <li>Dashboard surfaces positions with Hashscan explorer links</li>
      </ul>
    </div>
  );
}
