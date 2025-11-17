#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Client,
  ContractCreateTransaction,
  ContractCreateFlow,
  FileAppendTransaction,
  FileContentsQuery,
  FileCreateTransaction,
  FileId,
  Hbar,
  PrivateKey
} from '@hashgraph/sdk';
import { appConfig } from '../src/config/environment.js';

const UPLOAD_RETRIES = Number(process.env.UPLOAD_RETRIES || 5);
const UPLOAD_RETRY_DELAY_MS = Number(process.env.UPLOAD_RETRY_DELAY_MS || 1000);

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry(fn, description) {
  let attempt = 0;
  let lastError;
  while (attempt < UPLOAD_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt >= UPLOAD_RETRIES) {
        throw error;
      }
      console.warn(`${description} failed (attempt ${attempt}), retrying in ${UPLOAD_RETRY_DELAY_MS}ms...`);
      await delay(UPLOAD_RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

async function buildClient() {
  const operatorId = appConfig.operatorId;
  const operatorKey = appConfig.operatorKey;
  if (!operatorId || !operatorKey) {
    throw new Error('OPERATOR_ID and OPERATOR_KEY must be set');
  }

  let client;
  if (appConfig.network === 'local' && appConfig.grpcNode) {
    client = Client.forNetwork({ [appConfig.grpcNode]: '0.0.3' });
  } else {
    client = Client.forName(appConfig.network);
  }
  client.setOperator(operatorId, PrivateKey.fromString(operatorKey));
  return client;
}

function loadBytecode() {
  const artifactPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../artifacts/contracts/LendingPool.sol/LendingPool.json'
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error('Artifact not found. Run `npm run compile` first.');
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
  const bytecode = artifact.bytecode;
  if (!bytecode) {
    throw new Error('Bytecode missing from artifact');
  }
  return bytecode;
}

function toBytes(bytecodeHex) {
  const hex = bytecodeHex.replace(/^0x/, '');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function uploadBytecode(client, bytecode, operatorKey) {
  console.log(`Uploading bytecode (~${bytecode.byteLength} bytes) to Hedera...`);
  const initialChunk = Math.min(bytecode.byteLength, 4000);
  const receipt = await executeWithRetry(async () => {
    const tx = await new FileCreateTransaction()
      .setKeys([operatorKey.publicKey])
      .setContents(bytecode.subarray(0, initialChunk))
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);
    return tx.getReceipt(client);
  }, 'FileCreateTransaction');
  const fileId = receipt.fileId;
  if (!fileId) {
    throw new Error('Bytecode file creation failed');
  }

  let offset = initialChunk;
  while (offset < bytecode.byteLength) {
    const chunk = bytecode.subarray(offset, Math.min(bytecode.byteLength, offset + 4000));
    await executeWithRetry(async () => {
      const tx = await new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(chunk)
        .setMaxTransactionFee(new Hbar(2))
        .execute(client);
      await tx.getReceipt(client);
    }, `FileAppendTransaction(offset=${offset})`);
    offset += chunk.byteLength;
  }
  const contents = await new FileContentsQuery().setFileId(fileId).execute(client);
  console.log(`Bytecode file ${fileId.toString()} confirmed with ${contents.length} bytes.`);
  return fileId;
}

async function main() {
  const client = await buildClient();
  const bytecodeHex = loadBytecode();
  const bytecodeBytes = toBytes(bytecodeHex);
  const gas = Number(process.env.DEPLOY_GAS || 4_000_000);
  const initialBalance = Number(process.env.DEPLOY_INITIAL_HBAR || 1);
  const operatorKey = PrivateKey.fromString(appConfig.operatorKey);

  if (process.env.DIRECT_FLOW === 'true') {
    console.log('Deploying via ContractCreateFlow (direct bytecode)...');
    const flow = await new ContractCreateFlow()
      .setBytecode(bytecodeHex)
      .setGas(gas)
      .setInitialBalance(new Hbar(initialBalance))
      .setAdminKey(operatorKey)
      .execute(client);
    const receipt = await flow.getReceipt(client);
    console.log('Contract deployed at', receipt.contractId?.toString());
    return;
  }

  let bytecodeFileId;
  if (process.env.BYTECODE_FILE_ID) {
    bytecodeFileId = FileId.fromString(process.env.BYTECODE_FILE_ID);
    console.log(`Using existing bytecode file ${bytecodeFileId.toString()}...`);
  } else {
    bytecodeFileId = await uploadBytecode(client, bytecodeBytes, operatorKey);
    if (process.env.UPLOAD_ONLY === 'true') {
      console.log('UPLOAD_ONLY set, skipping contract creation.');
      return;
    }
    console.log('Creating contract...');
  }

  const contractCreateTx = await new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(gas)
    .setInitialBalance(new Hbar(initialBalance))
    .setAdminKey(operatorKey)
    .execute(client);

  const contractReceipt = await contractCreateTx.getReceipt(client);
  console.log('Contract deployed at', contractReceipt.contractId?.toString());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
