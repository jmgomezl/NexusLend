# NexusLend – Hedera DeFi Hub

Feature-complete hackathon reference showcasing Hedera-native compliance (HTS KYC), on-chain lending logic, risk monitoring, and a lightweight analytics dashboard.

## Prerequisites
- Node.js 18+
- Hedera portal account funded on **testnet** (https://portal.hedera.com/)
- Docker (optional) for the Hedera Local Node image
- (Recommended) HashPack or Blade wallet for HTS token associations

## Setup
1. Copy `.env.example` to `.env.testnet` and set `OPERATOR_ID`, `OPERATOR_KEY`, `NETWORK=testnet`, and topic/token ids.
2. Install packages (updates `package-lock.json`):
   ```bash
   npm install
   ```
3. (Optional local stack):
   ```bash
   docker run -d -p 50211:50211 -p 50212:50212 -p 5551:5551 hashgraph/hedera-local-node:latest
   export NETWORK=local
   ```

## Architecture Overview
- **Contracts** – `contracts/LendingPool.sol` stores positions, collateral ratios, and liquidation logic compiled with Hardhat.
- **Services/CLI** – `src/services/*` and `src/index.js` orchestrate HTS KYC checks, borrow/supply actions, and operator utilities.
- **Monitoring** – `src/monitoring/healthMonitor.js` ingests mirror-node topics, tracks account health, and auto-liquidates unhealthy borrowers.
- **API & Dashboard** – `src/server/api.js` exposes JSON endpoints; `dashboard/index.html` visualizes pool metrics by consuming the API.

## Key Commands
| Command | Purpose |
| --- | --- |
| `npm run dev` | Commander CLI watcher for local operations |
| `npm run api` | Launch Fastify API serving metrics and position data |
| `npm run monitor` | Run the liquidation/health monitor daemon |
| `node scripts/setupToken.js` | Mint an HTS reserve token with admin + KYC keys |
| `node scripts/seedLiquidity.js` | Seed demo collateral using operator funds |
| `npm run compile` / `npm run deploy:testnet` | Compile Solidity contracts & deploy via Hedera JS SDK |
| `node src/index.js lending:*` | Supply, borrow, repay, liquidate, or inspect positions |

## Smart-Contract & Hedera Workflow
1. Compile and deploy: `npm run compile && npm run deploy:testnet` (requires `OPERATOR_*` env vars and `.env.testnet`).
2. Record the `LendingPool` contract ID and update `config/testnet.json`.
3. Mint reserve tokens via `scripts/setupToken.js` and grant KYC to borrowers with `src/index.js kyc:grant`.
4. Associate client accounts with the reserve token (wallet or `TokenAssociateTransaction`), then drive supply/borrow actions through the CLI/API.

## Monitoring & Dashboard
1. Start the API: `npm run api` (defaults to `http://localhost:4000`).
2. Start the health monitor: `npm run monitor` (auto-tracks borrowers and liquidates below-threshold positions, also publishes warnings to logs/HCS topic).
3. Open `dashboard/index.html` in a browser; it fetches `/metrics` and `/positions/:accountId` to visualize health factors and utilization.

### Wallet-enabled dashboard
1. With the API running, serve the dashboard over `http://localhost` (from the repo root run `python -m http.server 3000` or `npx serve` and navigate to `/dashboard/`) and open it in a Chromium browser; if the HashConnect script can’t load, you can still paste your account ID in the “manual override” field to interact.
2. Associate token `0.0.7266311` inside HashPack, then press **Request KYC** on the dashboard; the backend uses `KYC_PRIVATE_KEY` (or `OPERATOR_KEY`) to submit `TokenGrantKycTransaction`.
3. Use the Supply / Borrow / Repay forms to call the `/lending/*` API routes; the UI shows success/failure logs and updates pool metrics/positions automatically.

## Testing
```bash
npm test
```
Jest exercises lending math, liquidation workflows, config bootstrapping, and monitor logic (mirror-node calls are mocked/skipped under `NODE_ENV=test`).

## Testnet Workflow
1. Use the portal faucet to fund operator + borrowers.
2. Run token setup, update configs, and ensure borrowers have KYC + token associations.
3. Execute CLI/API flows; inspect mirror-node events or the dashboard to show live utilization.

## Local-Network Workflow
1. Start the Hedera local node container.
2. Set `NETWORK=local`, `OPERATOR_ID=0.0.2`, and the default dev key supplied by the Docker docs.
3. Update `config/local.json` + `.env.local` with the mirror-node URL and topic ids emitted by the local stack.
4. Repeat CLI/API/monitor steps; mirror REST lives at `http://localhost:5551`, gRPC at `127.0.0.1:50211`.

## Next Steps
- Plug real HTS token transfers into `LendingPool` (currently stubbed) or extend with Hedera Native Token Service precompiles.
- Emit structured events to a Hedera Consensus Service topic for on-chain audit logs and integrate wallet onboarding (HashPack deep links).
