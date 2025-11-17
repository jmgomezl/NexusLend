import { AccountId, Client, PrivateKey, TokenGrantKycTransaction } from '@hashgraph/sdk';
import { appConfig, requireEnv } from '../config/environment.js';

let cachedClient;

function buildClient() {
  const operatorId = requireEnv('operatorId');
  const operatorKey = requireEnv('operatorKey');
  let client;

  if (appConfig.network === 'local' && appConfig.grpcNode) {
    client = Client.forNetwork({ [appConfig.grpcNode]: '0.0.3' });
  } else {
    client = Client.forName(appConfig.network);
  }

  client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey));
  return client;
}

export function getClient() {
  if (!cachedClient) {
    cachedClient = buildClient();
  }
  return cachedClient;
}

export async function isAccountKycGranted(accountId, tokenId) {
  if (!appConfig.mirrorNode) {
    throw new Error('Mirror node URL missing; cannot verify KYC status');
  }

  const mirrorUrl = new URL(
    `/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`,
    appConfig.mirrorNode
  );
  const response = await fetch(mirrorUrl);
  if (!response.ok) {
    throw new Error(`Mirror node query failed with status ${response.status}`);
  }

  const payload = await response.json();
  const tokens = payload.tokens || [];
  const record = tokens.find((entry) => entry.token_id === tokenId);
  if (!record) {
    return false;
  }
  return (record.kyc_status || '').toLowerCase() === 'granted';
}

export async function grantKycForAccount({ accountId, tokenId, kycPrivateKey }) {
  if (!kycPrivateKey) {
    throw new Error('KYC private key required to grant KYC');
  }

  const client = getClient();
  const kycKey = PrivateKey.fromString(kycPrivateKey);

  const tx = await new TokenGrantKycTransaction()
    .setTokenId(tokenId)
    .setAccountId(accountId)
    .freezeWith(client)
    .sign(kycKey);

  const submit = await tx.execute(client);
  const receipt = await submit.getReceipt(client);
  return receipt.status.toString();
}
