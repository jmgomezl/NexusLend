import fastify from 'fastify';
import pino from 'pino';
import { LendingService } from '../services/lendingService.js';
import { HealthMonitor } from '../monitoring/healthMonitor.js';
import { KycService } from '../services/kycService.js';
import { MirrorNodeClient } from '../clients/mirrorNodeClient.js';
import { appConfig } from '../config/environment.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', name: 'api' });
const server = fastify({ logger });
const lendingService = new LendingService();
const kycService = lendingService.kycService || new KycService();
const fallbackKycKey = process.env.KYC_PRIVATE_KEY || appConfig.operatorKey;
const mirrorClient = new MirrorNodeClient({ baseUrl: appConfig.mirrorNode });
const monitor = new HealthMonitor({ lendingService, logger });
monitor.start();

server.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    reply.status(204).send();
    return;
  }
  done();
});

server.get('/healthz', async () => ({ status: 'ok' }));

server.get('/metrics', async () => {
  const accounts = Array.from(lendingService.positions?.entries?.() || []);
  const supplied = accounts.reduce((acc, [, position]) => acc + position.supplied, 0);
  const borrowed = accounts.reduce((acc, [, position]) => acc + position.borrowed, 0);
  return {
    timestamp: new Date().toISOString(),
    accounts: accounts.length,
    supplied,
    borrowed,
    sample: accounts.map(([accountId]) => accountId).slice(0, 25)
  };
});

server.get('/positions/:accountId', async (request, reply) => {
  const { accountId } = request.params;
  const position = await lendingService.getPosition(accountId);
  const healthFactor = await lendingService.getHealthFactor(accountId);
  if (!position) {
    return reply.code(404).send({ error: 'Account not found' });
  }
  return { accountId, position, healthFactor };
});


server.get('/kyc/status/:accountId', async (request, reply) => {
  const { accountId } = request.params;
  if (!accountId) {
    return reply.code(400).send({ error: 'accountId required' });
  }
  const granted = await kycService.isGranted(accountId);
  return { accountId, granted };
});

server.post('/kyc/grant', async (request, reply) => {
  const { accountId, kycPrivateKey } = request.body || {};
  if (!accountId || !kycPrivateKey) {
    return reply.code(400).send({ error: 'accountId and kycPrivateKey required' });
  }
  const status = await kycService.grant(accountId, kycPrivateKey);
  return { accountId, status };
});


server.get('/balances/:accountId', async (request, reply) => {
  const { accountId } = request.params;
  if (!accountId) {
    return reply.code(400).send({ error: 'accountId required' });
  }
  try {
    const account = await mirrorClient.fetchJson(`/api/v1/accounts/${accountId}`);
    const hbar = account.balance ? account.balance.balance / 100000000 : 0;
    const tokenEntry = account.balance?.tokens?.find((token) => token.token_id === appConfig.reserveTokenId);
    const reserve = tokenEntry ? Number(tokenEntry.balance) / Math.pow(10, tokenEntry.decimals || 0) : 0;
    return { accountId, hbar, reserve };
  } catch (error) {
    request.log.error({ err: error, accountId }, 'Balance lookup failed');
    return reply.code(500).send({ error: error.message });
  }
});
server.post('/kyc/request', async (request, reply) => {

  const { accountId } = request.body || {};
  if (!accountId) {
    return reply.code(400).send({ error: 'accountId required' });
  }
  if (!fallbackKycKey) {
    return reply.code(500).send({ error: 'KYC key not configured' });
  }
  try {
    const status = await kycService.grant(accountId, fallbackKycKey);
    return { accountId, status };
  } catch (error) {
    request.log.error({ err: error, accountId }, 'KYC request failed');
    return reply.code(500).send({ error: error.message });
  }
});

server.post('/lending/supply', async (request) => {
  const { accountId, amount } = request.body || {};
  const result = await lendingService.supply({ accountId, amount: Number(amount) });
  monitor.trackAccount(accountId);
  return result;
});

server.post('/lending/borrow', async (request, reply) => {
  const { accountId, amount } = request.body || {};
  try {
    const result = await lendingService.borrow({ accountId, amount: Number(amount) });
    monitor.trackAccount(accountId);
    return result;
  } catch (error) {
    reply.code(400);
    return { error: error.message };
  }
});

server.post('/lending/repay', async (request) => {
  const { accountId, amount } = request.body || {};
  return lendingService.repay({ accountId, amount: Number(amount) });
});

const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const host = process.env.API_HOST || '0.0.0.0';

server
  .listen({ port, host })
  .then(() => logger.info(`API listening on http://${host}:${port}`))
  .catch((error) => {
    logger.error(error, 'Failed to start API');
    process.exit(1);
  });
