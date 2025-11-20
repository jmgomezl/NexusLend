import { useEffect, useState, useCallback } from 'react';
import { HashConnect } from 'hashconnect';

const APP_METADATA = {
  name: 'NexusLend Dashboard',
  description: 'Hedera DeFi borrow & lend hub',
  icon: 'https://hashpack.app/img/logo.svg'
};

export function useHashConnect(network = 'testnet') {
  const [hashconnect, setHashconnect] = useState(null);
  const [pairing, setPairing] = useState(null);
  const [pairingString, setPairingString] = useState('');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState('DISCONNECTED');

  useEffect(() => {
    const hc = new HashConnect();
    let mounted = true;
    async function init() {
      try {
        const initData = await hc.init(APP_METADATA, network, false);
        if (!mounted) return;
        setHashconnect(hc);
        setPairingString(initData.pairingString);
        setStatus('READY');
        if (initData.savedPairings?.length) {
          const existing = initData.savedPairings[0];
          setPairing(existing);
          setAccountId(existing.accountIds[0]);
          setStatus('CONNECTED');
        }
        hc.foundExtensionEvent.once((ext) => {
          setStatus('PAIRING');
          hc.connectToLocalWallet(initData.pairingString, ext);
        });
        hc.pairingEvent.once((pairingData) => {
          setPairing(pairingData);
          setAccountId(pairingData.accountIds[0]);
          setStatus('CONNECTED');
        });
      } catch (error) {
        console.error('HashConnect init failed', error);
        setStatus('ERROR');
      }
    }
    init();
    return () => {
      mounted = false;
      hc.disconnect();
    };
  }, [network]);

  const requestPairing = useCallback(() => {
    if (!hashconnect || !pairingString) return;
    setStatus('PAIRING');
    hashconnect.connectToLocalWallet(pairingString);
  }, [hashconnect, pairingString]);

  return { hashconnect, pairing, pairingString, accountId, status, requestPairing, setAccountId };
}
