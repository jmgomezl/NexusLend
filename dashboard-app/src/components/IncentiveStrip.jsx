export function IncentiveStrip({ incentives, tokenSymbol }) {
  return (
    <section className="panel incentive-strip">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Yield Mechanics</p>
          <h2>Why supply & borrow?</h2>
        </div>
        <span className="muted badge">Live demo economics</span>
      </div>
      <div className="incentive-grid">
        {incentives.map((item) => (
          <article key={item.label} className="incentive-card">
            <div className="label">{item.label}</div>
            <div className="value">{item.value}</div>
            <p className="muted">{item.description}</p>
          </article>
        ))}
      </div>
      <p className="muted footnote">
        *APR/fees are illustrative for this hackathon build. Actual rates settle on-chain via the NexusLend smart contract
        and {tokenSymbol} reserve utilization.
      </p>
    </section>
  );
}
