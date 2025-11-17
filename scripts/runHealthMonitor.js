#!/usr/bin/env node
import 'dotenv/config';
import pino from 'pino';
import { LendingService } from '../src/services/lendingService.js';
import { HealthMonitor } from '../src/monitoring/healthMonitor.js';

async function main() {
  const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
  const lendingService = new LendingService();
  const monitor = new HealthMonitor({ lendingService, logger });

  monitor.start();
  logger.info('Health monitor running. Press Ctrl+C to exit.');

  process.on('SIGINT', () => {
    monitor.stop();
    logger.info('Health monitor stopped');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
