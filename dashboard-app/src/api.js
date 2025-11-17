const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

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
  getMetrics: () => request('/metrics'),
  getPosition: (accountId) => request(`/positions/${accountId}`),
  requestKyc: (accountId) => request('/kyc/request', { method: 'POST', body: JSON.stringify({ accountId }) }),
  supply: (accountId, amount) => request('/lending/supply', { method: 'POST', body: JSON.stringify({ accountId, amount }) }),
  borrow: (accountId, amount) => request('/lending/borrow', { method: 'POST', body: JSON.stringify({ accountId, amount }) }),
  repay: (accountId, amount) => request('/lending/repay', { method: 'POST', body: JSON.stringify({ accountId, amount }) })
};
