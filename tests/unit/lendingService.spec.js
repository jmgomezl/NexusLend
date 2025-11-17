import { describe, it, expect, beforeEach } from '@jest/globals';
import { LendingService } from '../../src/services/lendingService.js';

class FakeKycService {
  constructor({ granted = true } = {}) {
    this.granted = granted;
  }

  async ensure() {
    if (!this.granted) {
      throw new Error('KYC not granted');
    }
    return true;
  }
}

describe('LendingService', () => {
  let service;

  beforeEach(() => {
    service = new LendingService({ kycService: new FakeKycService() });
  });

  it('tracks supplies per account', async () => {
    const result = await service.supply({ accountId: '0.0.1001', amount: 100 });
    expect(result.supplied).toBe(100);
  });

  it('denies borrowing without sufficient collateral', async () => {
    await service.supply({ accountId: '0.0.1001', amount: 100 });
    await expect(service.borrow({ accountId: '0.0.1001', amount: 90 })).rejects.toThrow(
      /Borrow denied/
    );
  });

  it('allows borrowing within the collateral factor', async () => {
    await service.supply({ accountId: '0.0.1001', amount: 100 });
    const result = await service.borrow({ accountId: '0.0.1001', amount: 50 });
    expect(result.borrowed).toBe(50);
  });

  it('computes infinite health factor when no debt', async () => {
    await service.supply({ accountId: '0.0.1001', amount: 100 });
    await expect(service.getHealthFactor('0.0.1001')).resolves.toBe(Infinity);
  });

  it('liquidates unhealthy positions', async () => {
    await service.supply({ accountId: '0.0.1001', amount: 100 });
    await service.borrow({ accountId: '0.0.1001', amount: 50 });
    const result = await service.liquidate({ accountId: '0.0.1001', repayAmount: 25 });
    expect(result.borrowed).toBe(25);
  });
});
