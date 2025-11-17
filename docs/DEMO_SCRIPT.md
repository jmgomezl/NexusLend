# NexusLend Demo Script

## 1. Warm-up
1. Start Fastify API (Render deployment or `npm run api` locally).
2. Launch the dashboard (GitHub Pages or `npm run dev`).
3. Have HashPack ready with two accounts:
   - Operator/lender (already associated & KYC admin)
   - Borrower (associated with token `0.0.7266311`)
4. Ensure the Render API and GitHub Pages dashboard are reachable.

## 2. Walkthrough
1. **Connect Wallet** (HashPack) or enter account manually.
2. **Request KYC** – click the button, API grants KYC via operator key; dashboard shows success.
3. **Supply** – enter an amount, click Supply; metrics update, log shows supply status.
4. **Borrow** – enter amount under collateral factor, confirm; health factor appears in table.
5. **Repay** – repay a portion, see metrics adjust.
6. **Monitoring view** – highlight auto-tracked positions and health logs (from Render logs or API output).

## 3. Closing
- Show GitHub Pages link + Render API status.
- Mention next steps (UI polish, analytics, mainnet readiness).
