# Hedera DeFi Architecture

## Components
- **Smart Contracts (`contracts/`)** – Solidity lending pool managing deposits, borrows, and interest using HTS-wrapped tokens.
- **Node Services (`src/services/`)** – JS SDK layer for KYC, liquidity orchestration, and liquidation automation;
- **Monitoring (`src/monitoring/`)** – mirror-node based watchdogs for utilization, health factors, and topic alerts.
- **CLI/API (`src/index.js`)** – Commander CLI plus optional REST shim for ops.
- **Dashboard (`dashboard/`)** – Lightweight web UI consuming mirror-node + REST endpoints.

## Flows
1. **Tokenization & KYC**
   - `scripts/setupToken.js` mints HTS reserve tokens with KYC/Fee keys.
   - `src/services/kycService.js` queries mirror-node `/accounts/{id}/tokens` to confirm KYC, grants via `TokenGrantKycTransaction`.
2. **Liquidity Lifecycle**
   - Deposits call `LendingPool.supply()` (HTS `transferFrom` + share accounting).
   - Borrows require `kycService.ensure()` and `LendingPool.borrow()`, which enforces collateral ratio + updates debt tokens.
3. **Monitoring & Risk**
   - `src/monitoring/healthMonitor.js` polls mirror-node topic data + contract state; flags unhealthy accounts and triggers `liquidate()` transactions.
   - Alerts relay through Hedera Consensus Service topics for dashboards + bots.
4. **Dashboard & APIs**
   - Dashboard fetches mirror-node token balances and contract events to show utilization, APR, health factors, and recent KYC actions.

## Data Model
- **Position**: { supplied, borrowed, avgInterestIndex, lastUpdated }
- **Risk Params**: collateralFactor, liquidationThreshold, reserveFactor per asset.
- **Events**: `Supply`, `Borrow`, `Repay`, `Liquidate`, `KycGranted`, `RiskAlert` emitted to HCS topic + contract logs.

## Deployment Targets
- **Testnet**: primary showcase; uses Hedera portal accounts, public mirror node, HashPack wallet for associations.
- **Local Node**: Dockerized Hedera node for offline dev/testing; mirror at `localhost:5551`.
- **Future Mainnet**: swap config + secrets; integrate HCS cross-network bridging for compliance evidence.
