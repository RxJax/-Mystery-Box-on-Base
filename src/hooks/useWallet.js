import { useState, useCallback, useEffect } from 'react';
import { SUPPORTED_CHAINS, CHAIN_CONFIG, BASE_CHAIN_ID } from '../config/contract';

export function useWallet() {
  const [address, setAddress]     = useState(null);
  const [balance, setBalance]     = useState(null);
  const [chainId, setChainId]     = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]         = useState(null);

  const isMetaMask = typeof window !== 'undefined' && !!window.ethereum;
  const isCorrectChain = chainId !== null && SUPPORTED_CHAINS.includes(chainId);
  const isEthereumMainnet = chainId === 1;
  const chainConfig = chainId ? (CHAIN_CONFIG[chainId] ?? null) : null;

  // Use Base Mainnet as the default target if on wrong network
  const targetChainId = SUPPORTED_CHAINS.includes(chainId) ? chainId : BASE_CHAIN_ID;

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
    if (!window.ethereum) {
      setError('EVM Wallet not found. Please use Base app or MetaMask.');
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
  }, [fetchBalance]);

  // Disconnect
  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
  }, []);

  // Switch to Base
  const switchToBase = useCallback(async () => {
    if (!window.ethereum) return;
    const cfg = CHAIN_CONFIG[BASE_CHAIN_ID];
    const hexId = '0x' + BASE_CHAIN_ID.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexId }],
      });
    } catch (switchError) {
      // Chain not added — try adding it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: hexId,
            chainName: cfg.name,
            rpcUrls: [cfg.rpcUrl],
            blockExplorerUrls: [cfg.blockExplorer],
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          }],
        });
      }
    }
  }, []);

  // Listen for changes
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

  // Auto-connect
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
    targetChainId,
    chainConfig,
    isEthereumMainnet,
    isMetaMask, // renaming to isEVM for clarity
    isConnecting,
    isCorrectChain,
    error,
    connect,
    disconnect,
    switchToBase,
    refreshBalance: () => fetchBalance(address),
  };
}
