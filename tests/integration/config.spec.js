import { describe, it, expect, beforeAll } from '@jest/globals';

let env;

describe('appConfig', () => {
  beforeAll(async () => {
    process.env.NETWORK = process.env.NETWORK || 'testnet';
    ({ appConfig: env } = await import('../../src/config/environment.js'));
  });

  it('exposes network + identifiers', () => {
    expect(env.network).toBeDefined();
    expect(env.kycTokenId).toBeDefined();
  });
});
