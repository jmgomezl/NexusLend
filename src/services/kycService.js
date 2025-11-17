import { appConfig } from '../config/environment.js';
import { getClient, grantKycForAccount, isAccountKycGranted } from '../clients/hederaClient.js';

export class KycService {
  constructor({ tokenId = appConfig.kycTokenId } = {}) {
    this.tokenId = tokenId;
  }

  async isGranted(accountId) {
    return isAccountKycGranted(accountId, this.tokenId);
  }

  async ensure(accountId) {
    const granted = await this.isGranted(accountId);
    if (!granted) {
      throw new Error(`Account ${accountId} has not been granted KYC for token ${this.tokenId}`);
    }
    return true;
  }

  async grant(accountId, kycPrivateKey) {
    return grantKycForAccount({ accountId, tokenId: this.tokenId, kycPrivateKey });
  }

  getClient() {
    return getClient();
  }
}
