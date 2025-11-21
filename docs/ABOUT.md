# NexusLend Technical Overview

NexusLend is a Hedera-native lending protocol designed for hackathon demos and early operator feedback. This document explains how each repo component fits into the architecture so Hedera reviewers can inspect the system quickly.

## High-Level Flow

1. **Users interact with the React dashboard** (`dashboard-app/`) via HashConnect. They can request KYC, supply the reserve token, borrow, or repay debt.
2. **Frontend talks to the API** (`src/server`, `src/clients`) that exposes secured endpoints:
   - `/metrics`, `/positions/:id` – mirror node reads via Render-hosted API.
   - `/kyc/request` – orchestrates HTS KYC grant on token `0.0.7266311`.
   - `/lending/*` – proxies to Hedera contracts or daemon (depending on action).
3. **Contracts** (`contracts/LendingPool.sol`) manage pool state. All state transitions emit events consumed by the monitoring scripts (`scripts/`, `src/monitoring`).
4. **Monitoring & Automation** watch mirror node topics for health factor changes, push alerts, and update API caches so the dashboard always shows real-time data.

## Repository Map

| Path | Purpose |
| ---- | ------- |
| `contracts/` | Solidity sources (Hardhat project). `LendingPool.sol` handles supply/borrow math; artifacts land in `artifacts/`. |
| `src/server` | Fastify API entry point (`api.ts`) plus handlers. Wraps `hederaClient.ts` to sign/submit transactions. |
| `src/clients/hederaClient.ts` | Centralized Hedera SDK client. Loads network/operator config from `config/*.json`. |
| `src/monitoring` | Health monitor + liquidation daemon. Subscribes to events, calculates health factor drift, posts alerts/background jobs. |
| `dashboard-app/` | Vite/React UI. Uses `useHashConnect` hook, `api.js` thin client, and modular panels to show metrics and execute actions. |
| `dashboard/` | Static HTML fallback (uses the same API). Handy for quick demos without React. |
| `scripts/` | Node scripts for deploying contracts, seeding liquidity, granting KYC, and simulating borrowers. |
| `tests/` | Jest suites. `tests/unit` mirrors lending math and monitoring, `tests/integration` mocks Hedera/mirror node endpoints. |
| `docs/` | GitHub Pages build output (`index.html` + assets). This `ABOUT.md` is rendered directly by Pages. |

## Contracts & Token Relationships

- **Reserve Token**: HTS asset `0.0.7266311`. Borrowers must associate and pass KYC before drawing liquidity.
- **LendingPool Contract**: `0.0.7266732` on Hedera testnet. Functions:
  - `supply(amount)` / `withdraw(amount)`
  - `borrow(amount)` / `repay(amount)`
  - Emits `PositionUpdated(accountId, supplied, borrowed, healthFactor)`
- **Events** feed the Render monitoring stack to recalculate risk and update API responses.

### Contract Internals

`LendingPool.sol` (deployed as `0.0.7266732`) tracks four core mappings:

| Storage | Description |
| ------- | ----------- |
| `balances[address].supplied` | Reserve tokens supplied by an account. |
| `balances[address].borrowed` | Outstanding borrow principal for the account. |
| `healthFactors[address]` | Cached health factor to drive monitoring. |
| `reserve.totalSupplied / totalBorrowed` | Aggregate pool liquidity + utilization. |

Key functions:
- `supply(uint256 amount)` – Transfers reserve tokens into the pool, updates `totalSupplied`, emits `PositionUpdated`.
- `withdraw(uint256 amount)` – Ensures the account retains enough collateral after withdrawal.
- `borrow(uint256 amount)` – Requires `kycGranted`, enforces `healthFactor >= minHealth`, increments `totalBorrowed`.
- `repay(uint256 amount)` – Burns borrower debt and recalculates health factor.

Security guardrails:
- Loan-to-value caps (configurable constants) ensure borrowers keep sufficient collateral.
- KYC gating via `kycGranted` mapping and the HTS association requirement.
- Re-entrancy guarded by the default Solidity checks plus strict ordering of state updates before external calls.
- `scripts/deploy.ts` uses least-privilege keys defined in `config/*.json`.

## API Layer

The Fastify API surfaces the following endpoints consumed by the dashboard:

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET /metrics` | Aggregates unique accounts, total supplied/borrowed, plus a sample list for table hydration. |
| `GET /positions/:id` | Reads mirror node data + contract state for a single account. |
| `POST /kyc/request` | Calls Render serverless function to grant KYC (uses operator keys from environment). |
| `POST /lending/(supply|borrow|repay)` | Wraps SDK transaction building, signs with the connected account via HashConnect, and submits to Hedera. |

Environment variables live in `.env.*` and never commit to Git. Config files (`config/local.json`, `config/testnet.json`) hold network IDs and mirror URLs.

## Dashboard Implementation Notes

- **HashConnect integration**: `src/hooks/useHashConnect.js` initializes the HashConnect SDK, manages pairing strings, and exposes a React hook for panels. The wallet panel shows a fallback pairing code for browsers HashPack cannot auto-attach to.
- **API client**: `dashboard-app/src/api.js` wraps fetch calls with the same endpoints described above. Setting `VITE_API_BASE` during `npm run build` shifts between local dev and Render deployments.
- **UI structure**: The home page shows metrics, wallet/KYC status, incentives (APYs + fees), transaction controls, positions table, and onboarding/about copy.
- **Styling**: `dashboard-app/src/styles.css` implements theme tokens, light/dark mode toggle, responsive layouts, and background animations. GitHub Pages uses the compiled assets in `docs/`.

## Monitoring & Automation

- `src/monitoring/healthMonitor.ts`: consumes events and recomputes health factors, pushing warnings to operators.
- `src/monitoring/liquidator.ts`: example script to flag unhealthy accounts (demo only; real liquidation logic would redeem collateral and repay debt).
- `scripts/seedLiquidity.ts`: seeds the reserve with example accounts.

The monitoring processes run under `npm run monitor` and expect `.env.monitor` for credentials (topic IDs, operator keys). They are structured to stay side-effect free on testnet (no auto-liquidations).

## Building & Deploying

1. `npm install`
2. `npm run dev` (API + dashboard with Vite)
3. `npm run monitor` (health daemon)
4. `npm run deploy:testnet` (Hardhat + Hedera SDK deployment)
5. `npm run build` inside `dashboard-app`, then copy `dist` into `docs/` before committing to `main` for GitHub Pages.

CI Expectations:
- `npm run lint` must pass before merging.
- `npm test` hits Jest suites (`tests/unit`, `tests/integration`).

## Extending the Project

Ideas:
- Replace hard-coded incentive card data with live APYs computed in `src/server/metricsService.ts`.
- Add liquidation execution flow in the monitoring daemon once on-chain functionality is mature.
- Expand API to expose historical position data for charting.

For questions, inspect `README.md` and `AGENTS.md` for coding/testing conventions. This document should provide enough context for Hedera reviewers to validate architecture decisions quickly. Kudos for checking out NexusLend! 🚀

## KYC Implementation Details

Hedera-native KYC enforcement combines HTS token permissions and backend orchestration:

1. **HTS Token Configuration**  
   - Reserve token `0.0.7266311` is created with `KYC_KEY` enabled.  
   - Borrowers must associate the token in HashPack and request KYC before borrowing.

2. **Backend Grant Flow (`/kyc/request`)**  
   - Endpoint receives `{ accountId }`.  
   - Server loads operator credentials (from `.env` / `config/testnet.json`) and instantiates `hederaClient`.  
   - Executes `TokenGrantKycTransaction` against the reserve token for the target account.  
   - Returns `{ status: 'GRANTED' }` when Hedera confirms the transaction.

3. **Dashboard UX**  
   - Wallet panel guides users to associate the token and includes a “Request KYC” button wired to `/kyc/request`.  
   - KYC status is displayed via `walletInfo.kyc`, refreshing automatically after successful grant.

4. **Smart Contract Enforcement**  
   - `LendingPool.borrow` checks `kycGranted[msg.sender]` (cached after the HTS token relationship is verified).  
   - Attempts to borrow without KYC revert immediately, and the dashboard surfaces the error via `txLog`.

5. **Monitoring**  
   - `healthMonitor` listens for `KycGranted` events to keep its cache consistent, ensuring automation respects HTS state.  
   - Alerts are raised if borrow attempts fail due to missing KYC so operators can assist.

This layered approach leverages Hedera’s native token permissions while keeping UI/UX smooth: users associate and request KYC inside the wallet, the backend performs the secure token grant, and the contract enforces it at execution time.
