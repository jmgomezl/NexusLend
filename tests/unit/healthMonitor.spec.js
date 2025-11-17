import { describe, it, expect, beforeEach } from '@jest/globals';
import { HealthMonitor } from '../../src/monitoring/healthMonitor.js';

class FakeLendingService {
  constructor() {
    this.positions = new Map([['0.0.123', { supplied: 100, borrowed: 90 }]]);
  }

  async getPosition(accountId) {
    return this.positions.get(accountId);
  }

  async getHealthFactor(accountId) {
    return accountId === '0.0.123' ? 0.9 : 2;
  }

  async liquidate({ accountId }) {
    this.positions.delete(accountId);
    return { accountId };
  }
}

describe('HealthMonitor', () => {
  let service;

  beforeEach(() => {
    service = new FakeLendingService();
  });

  it('liquidates unhealthy accounts', async () => {
    const monitor = new HealthMonitor({ lendingService: service, alertThreshold: 1.1, liquidationThreshold: 1 });
    await monitor.runOnce();
    expect(service.positions.has('0.0.123')).toBe(false);
  });
});
