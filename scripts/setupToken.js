#!/usr/bin/env node
import 'dotenv/config';
import {
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar
} from '@hashgraph/sdk';
import { appConfig, requireEnv } from '../src/config/environment.js';
import { getClient } from '../src/clients/hederaClient.js';

async function main() {
  const tokenName = process.env.RESERVE_TOKEN_NAME || 'DeFi Reserve Token';
  const tokenSymbol = process.env.RESERVE_TOKEN_SYMBOL || 'DRT';
  const initialSupply = Number(process.env.RESERVE_TOKEN_SUPPLY || 1_000_000);
  const kycKey = PrivateKey.fromString(requireEnv('operatorKey'));

  const client = getClient();

  const createTx = await new TokenCreateTransaction()
    .setTokenName(tokenName)
    .setTokenSymbol(tokenSymbol)
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(8)
    .setInitialSupply(initialSupply)
    .setTreasuryAccountId(requireEnv('operatorId'))
    .setSupplyType(TokenSupplyType.Infinite)
    .setAdminKey(kycKey.publicKey)
    .setKycKey(kycKey.publicKey)
    .setFreezeKey(kycKey.publicKey)
    .setTokenMemo('Demo lending reserve token')
    .setMaxTransactionFee(new Hbar(10))
    .freezeWith(client)
    .sign(kycKey);

  const submit = await createTx.execute(client);
  const receipt = await submit.getReceipt(client);
  console.log('Token id', receipt.tokenId?.toString());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
