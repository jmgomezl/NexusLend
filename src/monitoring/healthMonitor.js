import pino from 'pino';
import { appConfig } from '../config/environment.js';
import { MirrorNodeClient } from '../clients/mirrorNodeClient.js';
import { LendingService } from '../services/lendingService.js';

export class HealthMonitor {
  constructor({
    lendingService = new LendingService(),
    mirrorClient = new MirrorNodeClient({ baseUrl: appConfig.mirrorNode }),
    intervalMs = Number(process.env.MONITOR_INTERVAL_MS || 60_000),
    alertThreshold = 1.05,
    liquidationThreshold = 1.0,
    logger = pino({ level: process.env.LOG_LEVEL || 'info', name: 'health-monitor' })
  } = {}) {
    this.lendingService = lendingService;
    this.mirrorClient = mirrorClient;
    this.intervalMs = intervalMs;
    this.alertThreshold = alertThreshold;
    this.liquidationThreshold = liquidationThreshold;
    this.logger = logger;
    this.observedAccounts = new Set();
    this.task = null;
  }

  trackAccount(accountId) {
    this.observedAccounts.add(accountId);
  }

  untrackAccount(accountId) {
    this.observedAccounts.delete(accountId);
  }

  start() {
    if (this.task) {
      return;
    }
    this.task = setInterval(() => this.runOnce(), this.intervalMs);
    this.logger.info({ intervalMs: this.intervalMs }, 'Health monitor scheduled');
  }

  stop() {
    if (this.task) {
      clearInterval(this.task);
      this.task = null;
    }
  }

  async runOnce() {
    await this.#syncAccountsFromTopic();
    const accounts = this.#collectAccounts();
    if (accounts.length === 0) {
      this.logger.debug('No accounts to monitor yet');
      return;
    }

    for (const accountId of accounts) {
      try {
        await this.evaluateAccount(accountId);
      } catch (error) {
        this.logger.error({ accountId, err: error }, 'Failed to evaluate account');
      }
    }
  }

  async evaluateAccount(accountId) {
    const position = await this.lendingService.getPosition(accountId);
    if (!position) {
      return;
    }
    const healthFactor = await this.lendingService.getHealthFactor(accountId);

    if (healthFactor < this.liquidationThreshold) {
      this.logger.warn({ accountId, healthFactor }, 'Liquidation triggered');
      await this.lendingService.liquidate({ accountId, repayAmount: position.borrowed });
      return;
    }

    if (healthFactor < this.alertThreshold) {
      this.logger.warn({ accountId, healthFactor }, 'Health factor below alert threshold');
    } else {
      this.logger.debug({ accountId, healthFactor }, 'Account healthy');
    }
  }

  #collectAccounts() {
    const tracked = Array.from(this.observedAccounts);
    const serviceAccounts = Array.from(this.lendingService.positions?.keys?.() || []);
    return Array.from(new Set([...tracked, ...serviceAccounts]));
  }

  async #syncAccountsFromTopic() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    if (!appConfig.loanTopicId || !this.mirrorClient) {
      return;
    }
    try {
      const messages = await this.mirrorClient.getTopicMessages(appConfig.loanTopicId, { limit: 20 });
      (messages.messages || []).forEach((entry) => {
        try {
          const decoded = JSON.parse(Buffer.from(entry.message, 'base64').toString('utf-8'));
          if (decoded.accountId) {
            this.observedAccounts.add(decoded.accountId);
          }
        } catch (parseError) {
          this.logger.debug({ err: parseError }, 'Unable to parse topic message');
        }
      });
    } catch (error) {
      this.logger.warn({ err: error }, 'Unable to sync accounts from topic');
    }
  }
}
