import 'dotenv/config';
import { Client, PrivateKey, TokenAssociateTransaction } from '@hashgraph/sdk';

const BORROWER_ID = process.env.BORROWER2_ID;
const BORROWER_KEY = process.env.BORROWER2_KEY;
const TOKEN_ID = process.env.RESERVE_TOKEN_ID || '0.0.7266311';

if (!BORROWER_ID || !BORROWER_KEY) {
  console.error('BORROWER2_ID and BORROWER2_KEY must be set in .env');
  process.exit(1);
}

const rawKey = BORROWER_KEY.replace(/^0x/, '');
let borrowerKey;
try {
  borrowerKey = PrivateKey.fromStringED25519(rawKey);
} catch (error) {
  try {
    borrowerKey = PrivateKey.fromStringECDSA(rawKey);
  } catch (err) {
    console.error('Failed to parse borrower key as ED25519 or ECDSA');
    process.exit(1);
  }
}

const client = Client.forName(process.env.NETWORK || 'testnet').setOperator(BORROWER_ID, borrowerKey);

async function main() {
  const tx = await new TokenAssociateTransaction()
    .setAccountId(BORROWER_ID)
    .setTokenIds([TOKEN_ID])
    .freezeWith(client)
    .sign(borrowerKey);

  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  console.log(`Association status: ${receipt.status.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
