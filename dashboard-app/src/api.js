const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const TOKEN_SYMBOL = import.meta.env.VITE_TOKEN_SYMBOL || 'HCOP';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  tokenSymbol: TOKEN_SYMBOL,
  getMetrics: () => request('/metrics'),
  getPosition: (accountId) => request(`/positions/${accountId}`),
  getKycStatus: (accountId) => request(`/kyc/status/${accountId}`),
  getBalances: (accountId) => request(`/balances/${accountId}`),
  requestKyc: (accountId) => request('/kyc/request', { method: 'POST', body: JSON.stringify({ accountId }) }),
  supply: (accountId, amount) => request('/lending/supply', { method: 'POST', body: JSON.stringify({ accountId, amount }) }),
  borrow: (accountId, amount) => request('/lending/borrow', { method: 'POST', body: JSON.stringify({ accountId, amount }) }),
  repay: (accountId, amount) => request('/lending/repay', { method: 'POST', body: JSON.stringify({ accountId, amount }) })
};
