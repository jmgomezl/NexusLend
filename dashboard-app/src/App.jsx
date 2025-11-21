import { useEffect, useState } from 'react';
import { useHashConnect } from './hooks/useHashConnect.js';
import { api } from './api.js';
import { WalletPanel } from './components/WalletPanel.jsx';
import { TxControls } from './components/TxControls.jsx';
import { PositionTable } from './components/PositionTable.jsx';
import { AboutPanel } from './components/AboutPanel.jsx';
import { OnboardingPanel } from './components/OnboardingPanel.jsx';
import { MetricsGrid } from './components/MetricsGrid.jsx';
import { IncentiveStrip } from './components/IncentiveStrip.jsx';

export default function App() {
  const { accountId, status, requestPairing, setAccountId, pairingString } = useHashConnect('testnet');
  const [metrics, setMetrics] = useState({ accounts: 0, supplied: 0, borrowed: 0, sample: [], averageHealth: '--' });
  const [positions, setPositions] = useState([]);
  const [kycLog, setKycLog] = useState('');
  const [txLog, setTxLog] = useState('');
  const [walletInfo, setWalletInfo] = useState({ kyc: 'UNKNOWN', hbar: '--', reserve: '--' });
  const [lastUpdated, setLastUpdated] = useState('');
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('nexus-theme') || 'dark';
  });

  async function loadData() {
    try {
      const info = await api.getMetrics();
      const rows = await Promise.all((info.sample || []).map((id) => api.getPosition(id)));
      setPositions(rows);
      if (rows.length) {
        const avg =
          rows
            .map((entry) => Number(entry.healthFactor))
            .filter((value) => Number.isFinite(value))
            .reduce((acc, value) => acc + value, 0) / rows.length;
        setMetrics({ ...info, averageHealth: avg ? avg.toFixed(2) : '--' });
      } else {
        setMetrics(info);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!accountId) {
      setWalletInfo({ kyc: 'UNKNOWN', hbar: '--', reserve: '--' });
      return;
    }
    (async () => {
      try {
        const [kyc, balances] = await Promise.all([api.getKycStatus(accountId), api.getBalances(accountId)]);
        setWalletInfo({
          kyc: kyc.granted ? 'GRANTED' : 'NOT GRANTED',
          hbar: Number(balances.hbar || 0).toFixed(2),
          reserve: Number(balances.reserve || 0).toFixed(2)
        });
      } catch (error) {
        console.error(error);
        setWalletInfo({ kyc: 'ERROR', hbar: '--', reserve: '--' });
      }
    })();
  }, [accountId]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const classList = document.body.classList;
    classList.remove('theme-dark', 'theme-light');
    classList.add(`theme-${theme}`);
    document.body.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nexus-theme', theme);
    }
  }, [theme]);

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

  const statusLabel = (() => {
    switch (status) {
      case 'CONNECTED':
        return 'Connected to HashPack';
      case 'READY':
        return 'Ready to pair with HashPack';
      case 'PAIRING':
        return 'Waiting for HashPack approval';
      case 'UNAVAILABLE':
        return 'HashPack not detected; use manual account entry';
      case 'ERROR':
        return 'HashConnect failed to start';
      default:
        return 'Wallet not connected';
    }
  })();

  const statusNote =
    status === 'UNAVAILABLE'
      ? 'HashPack extension is unavailable in this browser context. Paste your account ID or open the pairing link once HashPack is installed.'
      : status === 'ERROR'
        ? 'HashConnect hit an error. Manual override still works while you refresh or reopen HashPack.'
        : '';

  const tokenSymbol = api.tokenSymbol;
  const statusMessage = lastUpdated ? `Last sync ${lastUpdated}` : statusLabel;
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const incentiveData = [
    {
      label: 'Supply Yield',
      value: '4.8% APY',
      description: 'Earn protocol share + NXL drip on every deposit.'
    },
    {
      label: 'Borrow APR',
      value: '6.2% APR',
      description: 'Interest accrues per block; repay anytime.'
    },
    {
      label: 'Protocol Fee',
      value: '0.35%',
      description: 'Captured from interest to fund reserves + monitoring.'
    }
  ];

  return (
    <>
      <div className="background-canvas" aria-hidden="true">
        <span className="bg-orb orb-one"></span>
        <span className="bg-orb orb-two"></span>
        <span className="bg-orb orb-three"></span>
      </div>
      <div className="page">
        <nav className="top-bar panel">
        <div className="brand">
          <div className="brand-logo">NX</div>
          <div>
            <h1>NexusLend</h1>
            <p className="tagline">Hedera-native borrow/lend with embeddable KYC</p>
          </div>
        </div>
        <div className="top-meta">
          <p className="muted">{statusMessage}</p>
          <div className="actions">
            <button onClick={requestPairing}>Connect HashPack</button>
            <button onClick={loadData} className="ghost">
              Refresh
            </button>
            <button
              onClick={toggleTheme}
              className="ghost icon-button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'light'}
              type="button"
            >
              <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-grid">
        <article className="panel overview-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Protocol Pulse</p>
              <h2>Liquidity snapshot</h2>
            </div>
          </div>
          <MetricsGrid
            accounts={metrics.accounts}
            supplied={metrics.supplied}
            borrowed={metrics.borrowed}
            healthStats={{ average: metrics.averageHealth }}
          />
        </article>

        <WalletPanel
          accountId={accountId}
          status={statusLabel}
          statusNote={statusNote}
          walletInfo={walletInfo}
          onManualChange={setAccountId}
          onConnect={requestPairing}
          onRequestKyc={handleKyc}
          logMessage={kycLog}
          pairingString={pairingString}
        />
      </section>

      <IncentiveStrip incentives={incentiveData} tokenSymbol={tokenSymbol} />

      <section className="panel control-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Treasury Actions</p>
            <h2>Manage liquidity</h2>
          </div>
        </div>
        <p className="muted">Amounts are denominated in the reserve token ({tokenSymbol}).</p>
        <TxControls
          disabled={!accountId}
          onSupply={handleSupply}
          onBorrow={handleBorrow}
          onRepay={handleRepay}
          logMessage={txLog}
          tokenSymbol={tokenSymbol}
        />
      </section>

      <section className="panel positions-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Portfolio Radar</p>
            <h2>Tracked positions</h2>
          </div>
        </div>
        <PositionTable positions={positions} />
      </section>

      <section className="two-column">
        <OnboardingPanel tokenSymbol={tokenSymbol} />
        <AboutPanel tokenSymbol={tokenSymbol} />
      </section>
      </div>
    </>
  );
}
