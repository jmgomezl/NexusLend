import { useEffect, useState } from 'react';
import { useHashConnect } from './hooks/useHashConnect.js';
import { api } from './api.js';
import { WalletPanel } from './components/WalletPanel.jsx';
import { TxControls } from './components/TxControls.jsx';
import { PositionTable } from './components/PositionTable.jsx';

export default function App() {
  const { accountId, status, requestPairing, setAccountId } = useHashConnect('testnet');
  const [metrics, setMetrics] = useState({ accounts: 0, supplied: 0, borrowed: 0, sample: [] });
  const [positions, setPositions] = useState([]);
  const [kycLog, setKycLog] = useState('');
  const [txLog, setTxLog] = useState('');

  async function loadData() {
    try {
      const info = await api.getMetrics();
      setMetrics(info);
      const rows = await Promise.all((info.sample || []).map((id) => api.getPosition(id)));
      setPositions(rows);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleKyc = async () => {
    if (!accountId) return setKycLog('Connect wallet or enter account ID first');
    try {
      setKycLog('Requesting KYC...');
      const result = await api.requestKyc(accountId);
      setKycLog(`KYC status: ${result.status}`);
    } catch (error) {
      setKycLog(error.message);
    }
  };

  const handleSupply = async (amount) => {
    if (!accountId) return setTxLog('Connect wallet first');
    try {
      setTxLog('Supplying...');
      await api.supply(accountId, amount);
      setTxLog('Supply successful');
      loadData();
    } catch (error) {
      setTxLog(error.message);
    }
  };

  const handleBorrow = async (amount) => {
    if (!accountId) return setTxLog('Connect wallet first');
    try {
      setTxLog('Borrowing...');
      await api.borrow(accountId, amount);
      setTxLog('Borrow successful');
      loadData();
    } catch (error) {
      setTxLog(error.message);
    }
  };

  const handleRepay = async (amount) => {
    if (!accountId) return setTxLog('Connect wallet first');
    try {
      setTxLog('Repaying...');
      await api.repay(accountId, amount);
      setTxLog('Repay successful');
      loadData();
    } catch (error) {
      setTxLog(error.message);
    }
  };

  return (
    <div className="page">
      <div className="hero">
        <WalletPanel
          accountId={accountId}
          status={status}
          onManualChange={setAccountId}
          onConnect={requestPairing}
          onRequestKyc={handleKyc}
          logMessage={kycLog}
        />
        <TxControls disabled={!accountId} onSupply={handleSupply} onBorrow={handleBorrow} onRepay={handleRepay} logMessage={txLog} />
      </div>
      <main>
        <div className="panel">
          <h2>Pool Metrics</h2>
          <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
            Accounts: {metrics.accounts} | Supplied: {metrics.supplied} | Borrowed: {metrics.borrowed}
          </div>
        </div>
        <PositionTable positions={positions} />
      </main>
    </div>
  );
}
