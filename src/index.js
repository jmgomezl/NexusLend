import { Command } from 'commander';
import pino from 'pino';
import { appConfig } from './config/environment.js';
import { KycService } from './services/kycService.js';
import { LendingService } from './services/lendingService.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const kycService = new KycService({ tokenId: appConfig.kycTokenId });
const lendingService = new LendingService({ kycService });

const program = new Command();
program
  .name('hedera-defi')
  .description('Hedera DeFi lending prototype with KYC gating')
  .version('0.1.0');

function wrapAction(action) {
  return async (...args) => {
    try {
      await action(...args);
    } catch (error) {
      logger.error(error, error.message);
      process.exitCode = 1;
    }
  };
}

program
  .command('kyc:check')
  .argument('<accountId>')
  .description('Check if an account has KYC for the configured token')
  .action(
    wrapAction(async (accountId) => {
      const granted = await kycService.isGranted(accountId);
      logger.info({ accountId, granted }, 'KYC status');
    })
  );

program
  .command('kyc:grant')
  .argument('<accountId>')
  .requiredOption('--key <privateKey>', 'Private key that holds the token KYC key')
  .description('Grant KYC to the provided account')
  .action(
    wrapAction(async (accountId, options) => {
      const receiptStatus = await kycService.grant(accountId, options.key);
      logger.info({ accountId, status: receiptStatus }, 'KYC grant submitted');
    })
  );

program
  .command('lending:supply')
  .argument('<accountId>')
  .argument('<amount>', 'Amount of reserve token to supply', parseFloat)
  .description('Supply collateral to the pool')
  .action(
    wrapAction(async (accountId, amount) => {
      const result = await lendingService.supply({ accountId, amount });
      logger.info({ accountId, result }, 'Supply updated');
    })
  );

program
  .command('lending:borrow')
  .argument('<accountId>')
  .argument('<amount>', 'Amount to borrow', parseFloat)
  .description('Borrow assets; requires KYC to be granted')
  .action(
    wrapAction(async (accountId, amount) => {
      const result = await lendingService.borrow({ accountId, amount });
      logger.info({ accountId, result }, 'Borrow executed');
    })
  );

program
  .command('lending:repay')
  .argument('<accountId>')
  .argument('<amount>', 'Amount to repay', parseFloat)
  .description('Repay borrowed amount')
  .action(
    wrapAction(async (accountId, amount) => {
      const result = await lendingService.repay({ accountId, amount });
      logger.info({ accountId, result }, 'Repay executed');
    })
  );

program
  .command('lending:position')
  .argument('<accountId>')
  .description('Inspect an account position and health factor')
  .action(
    wrapAction(async (accountId) => {
      const position = await lendingService.getPosition(accountId);
      const healthFactor = await lendingService.getHealthFactor(accountId);
      logger.info({ accountId, position, healthFactor }, 'Position');
    })
  );

program
  .command('lending:liquidate')
  .argument('<accountId>')
  .argument('<amount>', 'Amount to repay during liquidation', parseFloat)
  .description('Force-liquidate an unhealthy position')
  .action(
    wrapAction(async (accountId, amount) => {
      const result = await lendingService.liquidate({ accountId, repayAmount: amount });
      logger.info({ accountId, result }, 'Liquidation executed');
    })
  );

program.parseAsync(process.argv);
