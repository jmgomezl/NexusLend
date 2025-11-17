import { appConfig } from '../config/environment.js';

export class MirrorNodeClient {
  constructor({ baseUrl = appConfig.mirrorNode } = {}) {
    if (!baseUrl) {
      throw new Error('Mirror node URL is required');
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async fetchJson(path, searchParams) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }
    const response = await fetch(url);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Mirror node error ${response.status}: ${message}`);
    }
    return response.json();
  }

  async getTokenRelationships(accountId) {
    const data = await this.fetchJson(`/api/v1/accounts/${accountId}/tokens`);
    return data.tokens || [];
  }

  async getTopicMessages(topicId, { limit = 25, next = undefined } = {}) {
    return this.fetchJson(`/api/v1/topics/${topicId}/messages`, { limit, next });
  }

  async getContractState(contractId, accountId) {
    return this.fetchJson(`/api/v1/contracts/${contractId}/results/logs`, { 'account.id': accountId });
  }
}
