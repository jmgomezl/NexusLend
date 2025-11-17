#!/usr/bin/env node
import 'dotenv/config';
import { LendingService } from '../src/services/lendingService.js';
import { KycService } from '../src/services/kycService.js';
import { appConfig } from '../src/config/environment.js';

async function main() {
  const accountId = process.env.SEED_ACCOUNT_ID || appConfig.operatorId;
  const amount = Number(process.env.SEED_AMOUNT || 10_000);

  const kycService = new KycService();
  const lendingService = new LendingService({ kycService });

  await lendingService.supply({ accountId, amount });
  console.log(`Seeded ${amount} units into the pool for ${accountId}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
