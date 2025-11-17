# Repository Guidelines

## Project Structure & Module Organization
- `contracts/` holds Solidity sources such as `LendingPool.sol`; Hardhat drops ABI/artifacts here.
- `src/` hosts SDK clients, services, monitoring, and API modules (`src/monitoring`, `src/server`, `src/clients`), while `dashboard/` serves a static metrics UI powered by the API.
- `tests/` mirrors runtime layout (unit/integration) to keep coverage tied to its feature module.
- `scripts/` automates token setup, liquidity seeding, contract deployment, and monitoring processes.
- `config/` carries network profiles (`testnet.json`, `local.json`); `.env.*` stores operator secrets.

## Build, Test, and Development Commands
- `npm install` – pulls SDKs, Fastify, Hardhat, and testing libraries.
- `npm run dev` – nodemon CLI watcher (Commander) for local ops.
- `npm run api` / `npm run monitor` – launch the Fastify API and the liquidation daemon.
- `npm run compile` / `npm run deploy:testnet` – compile Solidity with Hardhat + deploy via the Hedera JS SDK script.
- `npm test` – executes Jest suites (unit, integration, monitoring).
- `npm run lint` / `npm run format` – run ESLint + Prettier.

## Coding Style & Naming Conventions
- 2-space indentation, semicolons mandatory, prefer `const`/`let` over `var`.
- camelCase for functions/variables, PascalCase for classes, kebab-case for file names except React/Vue components.
- Keep modules under 200 lines; export pure helpers from `src/lib` and centralize Hedera clients in `src/clients/hederaClient.ts`.
- Run `npm run lint` before any push; CI blocks on lint errors or formatting drift.

## Testing Guidelines
- Unit specs live in `tests/unit/*.spec.js` and cover lending math, monitoring, and service interactions (`lendingService.spec.js`, `healthMonitor.spec.js`).
- Integration specs under `tests/integration` should load `.env.testnet`, exercise KYC/mirror-node configs, and remain side-effect free by mocking network calls.
- Keep coverage high (≥80%) and add regression tests whenever changing collateral math, KYC logic, monitoring thresholds, or CLI/API handlers.

## Commit & Pull Request Guidelines
- History is greenfield; follow Conventional Commits (`feat: add collateral oracle adapter`).
- Reference Hedera HIPs or issue IDs in the body; include screenshots/logs for UI or CLI changes.
- Each PR needs a summary, testing checklist, linked issue, and rollback notes; request protocol + DevOps reviews when infra shifts.

## Security & Configuration Tips
- Keep operator ID/private key pairs in `.env.*`; rotate when sharing test accounts.
- Store mirror-node URLs, topic IDs, and contract IDs in `config/`, but pull secrets from Vault/AWS Secrets Manager; disable auto-association in production.
- Run Hardhat deployments with least-privilege keys; never commit `.env`, `artifacts/`, or private keys.
