import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOX_PRICE_ETH } from '../config/contract';

export function useContract(walletAddress) {
  const [jackpot, setJackpot]         = useState(null); // ETH string
  const [totalOpened, setTotalOpened] = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [txHash, setTxHash]           = useState(null);
  const [error, setError]             = useState(null);

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

  // Read jackpot + total opened
  const fetchStats = useCallback(async () => {
    if (!isDeployed) return;
    try {
      const contract = getContract(false);
      if (!contract) return;
      const [jp, total] = await Promise.all([
        contract.jackpotPool(),
        contract.totalBoxesOpened(),
      ]);
      setJackpot(ethers.formatEther(jp));
      setTotalOpened(Number(total));
    } catch (err) {
      console.warn('Contract read error:', err.message);
    }
  }, [getContract, isDeployed]);

  // Open box on-chain
  const openBoxOnChain = useCallback(async () => {
    if (!isDeployed || !walletAddress) return null;
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.openBox({
        value: ethers.parseEther(BOX_PRICE_ETH),
      });
      setTxHash(tx.hash);
      const receipt = await tx.wait();

      // Parse the BoxOpened event from receipt logs
      const iface = new ethers.Interface(CONTRACT_ABI);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed.name === 'BoxOpened') {
            return {
              tier: Number(parsed.args.tier),       // 0=Common, 1=Rare, 2=Legendary
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

  // Auto-fetch stats
  useEffect(() => { fetchStats(); }, [fetchStats]);

  return {
    jackpot,
    totalOpened,
    isLoading,
    txHash,
    error,
    isDeployed,
    openBoxOnChain,
    fetchStats,
  };
}
