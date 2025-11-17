import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import path from 'path';

loadEnv();

const network = process.env.NETWORK || 'testnet';
const configPath = path.resolve(process.cwd(), 'config', `${network}.json`);
let fileConfig = {};

if (fs.existsSync(configPath)) {
  fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export const appConfig = {
  network,
  operatorId: process.env.OPERATOR_ID,
  operatorKey: process.env.OPERATOR_KEY,
  mirrorNode: process.env.MIRROR_NODE_URL || fileConfig.mirrorNode,
  kycTokenId: process.env.KYC_TOKEN_ID || fileConfig.kycTokenId,
  reserveTokenId: process.env.RESERVE_TOKEN_ID || fileConfig.reserveTokenId,
  loanTopicId: process.env.LOAN_TOPIC_ID || fileConfig.loanTopicId,
  grpcNode: fileConfig.node
};

export function requireEnv(fieldName) {
  const value = appConfig[fieldName] || process.env[fieldName];
  if (!value) {
    throw new Error(`Missing required configuration: ${fieldName}`);
  }
  return value;
}
