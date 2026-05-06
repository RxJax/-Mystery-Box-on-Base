import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOX_PRICE_ETH, ENCODED_BUILDER_STRING } from '../config/contract';

export function useContract(walletAddress) {
  const [jackpot, setJackpot]           = useState(null); // ETH string
  const [totalOpened, setTotalOpened]   = useState(null);
  const [claimableBalance, setClaimableBalance] = useState('0');
  const [recentHistory, setRecentHistory] = useState([]);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [txHash, setTxHash]             = useState(null);
  const [error, setError]               = useState(null);

  const isDeployed = CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

  const getContract = useCallback((withSigner = false) => {
    if (!window.ethereum || !isDeployed) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (withSigner) {
      return provider.getSigner().then(signer =>
        new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      );
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, [isDeployed]);

  // Read jackpot + total opened + claimable + events
  const fetchStats = useCallback(async () => {
    if (!isDeployed) return;
    try {
      const contract = getContract(false);
      if (!contract) return;
      
      const calls = [
        contract.jackpotPool().catch(() => 0n),
        contract.totalBoxesOpened().catch(() => 0n),
        contract.queryFilter(contract.filters.BoxOpened(), -500).catch(() => []), 
      ];
      
      if (walletAddress) {
        calls.push(contract.claimableRewards(walletAddress).catch(() => 0n));
        calls.push(contract.getPlayerHistory(walletAddress).catch(() => []));
      }

      const results = await Promise.all(calls);
      
      setJackpot(ethers.formatEther(results[0]));
      setTotalOpened(Number(results[1]));
      
      // Parse events for global history
      const tierMap = { 0: TIERS.COMMON, 1: TIERS.RARE, 2: TIERS.LEGENDARY };
      const events = (results[2] || []).map(e => ({
        player: e.args?.player || '0x0',
        tier: tierMap[Number(e.args.tier)] || TIERS.COMMON,
        reward: e.args?.reward ? ethers.formatEther(e.args.reward) : '0',
        tokenSymbol: e.args?.tokenSymbol || 'ETH',
        timestamp: Date.now(), 
        txHash: e.transactionHash
      })).reverse();
      setRecentHistory(events);

      if (walletAddress && results[3] !== undefined) {
        setClaimableBalance(ethers.formatEther(results[3]));
        
        // Parse player history
        const tierMap = { 0: TIERS.COMMON, 1: TIERS.RARE, 2: TIERS.LEGENDARY };
        const pHistory = (results[4] || []).map(item => ({
          tier: tierMap[item.tier] || TIERS.COMMON,
          reward: ethers.formatEther(item.reward),
          tokenSymbol: item.tokenSymbol,
          timestamp: Number(item.timestamp) * 1000, // s to ms
        })).reverse();
        setPlayerHistory(pHistory);
      } else {
        setClaimableBalance('0');
        setPlayerHistory([]);
      }
    } catch (err) {
      console.warn('Contract read error:', err.message);
    }
  }, [getContract, isDeployed, walletAddress]);

  // Open box on-chain
  const openBoxOnChain = useCallback(async () => {
    if (!isDeployed || !walletAddress) return null;
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const contract = await getContract(true);
      
      // Populate transaction data
      const txData = await contract.openBox.populateTransaction({
        value: ethers.parseEther(BOX_PRICE_ETH),
      });

      // Append Base Builder Code to transaction data
      txData.data = txData.data + ENCODED_BUILDER_STRING.slice(2);

      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const tx = await signer.sendTransaction(txData);

      setTxHash(tx.hash);
      const receipt = await tx.wait();

      // Parse the BoxOpened event from receipt logs
      const iface = new ethers.Interface(CONTRACT_ABI);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed.name === 'BoxOpened') {
            return {
              tier: Number(parsed.args.tier),
              reward: ethers.formatEther(parsed.args.reward),
              tokenSymbol: parsed.args.tokenSymbol,
              txHash: tx.hash,
            };
          }
        } catch { /* not our event */ }
      }
      return null;
    } catch (err) {
      setError(err.reason || err.message || 'Transaction failed');
      return null;
    } finally {
      setIsLoading(false);
      fetchStats();
    }
  }, [isDeployed, walletAddress, getContract, fetchStats]);

  // Claim rewards on-chain
  const claimRewardsOnChain = useCallback(async () => {
    if (!isDeployed || !walletAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.claimRewards();
      setTxHash(tx.hash);
      await tx.wait();
    } catch (err) {
      setError(err.reason || err.message || 'Claim failed');
    } finally {
      setIsLoading(false);
      fetchStats();
    }
  }, [isDeployed, walletAddress, getContract, fetchStats]);

  // Auto-fetch stats
  useEffect(() => {
    fetchStats();
    // Auto-refresh every 20 seconds to keep global history fresh
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, [fetchStats, walletAddress]);

  return {
    jackpot,
    totalOpened,
    claimableBalance,
    recentHistory,
    playerHistory,
    isLoading,
    txHash,
    error,
    isDeployed,
    openBoxOnChain,
    claimRewardsOnChain,
    fetchStats,
  };
}
