import { useState, useCallback, useEffect } from 'react';
import { SUPPORTED_CHAINS, CHAIN_CONFIG, BASE_SEPOLIA_ID } from '../config/contract';

export function useWallet() {
  const [address, setAddress]     = useState(null);
  const [balance, setBalance]     = useState(null);
  const [chainId, setChainId]     = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]         = useState(null);

  const isMetaMask = typeof window !== 'undefined' && !!window.ethereum;
  const isCorrectChain = chainId !== null && SUPPORTED_CHAINS.includes(chainId);
  const chainConfig = chainId ? (CHAIN_CONFIG[chainId] ?? null) : null;

  // Fetch ETH balance
  const fetchBalance = useCallback(async (addr) => {
    if (!window.ethereum || !addr) return;
    try {
      const hex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [addr, 'latest'],
      });
      const wei = BigInt(hex);
      const eth = Number(wei) / 1e18;
      setBalance(eth.toFixed(4));
    } catch {
      setBalance(null);
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMask) {
      setError('MetaMask not found. Install it at metamask.io');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      setAddress(addr);

      const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
      const id = parseInt(chainHex, 16);
      setChainId(id);
      await fetchBalance(addr);
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMask, fetchBalance]);

  // Disconnect (clear state only — MetaMask doesn't expose a real disconnect)
  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
  }, []);

  // Switch to Base Sepolia
  const switchToBase = useCallback(async () => {
    if (!window.ethereum) return;
    const targetId = BASE_SEPOLIA_ID;
    const cfg = CHAIN_CONFIG[targetId];
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + targetId.toString(16) }],
      });
    } catch (switchError) {
      // Chain not added — try adding it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x' + targetId.toString(16),
            chainName: cfg.name,
            rpcUrls: [cfg.rpcUrl],
            blockExplorerUrls: [cfg.blockExplorer],
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          }],
        });
      }
    }
  }, []);

  // Listen for MetaMask account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (accounts) => {
      if (accounts.length === 0) disconnect();
      else { setAddress(accounts[0]); fetchBalance(accounts[0]); }
    };
    const onChain = (hex) => setChainId(parseInt(hex, 16));

    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged', onChain);
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts);
      window.ethereum.removeListener('chainChanged', onChain);
    };
  }, [disconnect, fetchBalance]);

  // Auto-connect if already authorized
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        const hex = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(hex, 16));
        fetchBalance(accounts[0]);
      }
    });
  }, [fetchBalance]);

  return {
    address,
    balance,
    chainId,
    chainConfig,
    isMetaMask,
    isConnecting,
    isCorrectChain,
    error,
    connect,
    disconnect,
    switchToBase,
    refreshBalance: () => fetchBalance(address),
  };
}
