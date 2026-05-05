import React, { useState, useCallback, useRef } from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { rollReward, BOX_PRICE, JACKPOT_CONTRIBUTION } from './utils/rewards';
import { TIERS } from './config/tokens';
import WalletBar from './components/WalletBar';
import MysteryBox from './components/MysteryBox';
import RewardReveal from './components/RewardReveal';
import JackpotPool from './components/JackpotPool';
import RewardHistory from './components/RewardHistory';
import StatsBar from './components/StatsBar';
import './index.css';

const TOTAL_ANIMATION_MS = 2800; // shake + crack + explode

// ─── Demo mode simulation state ─────────────────────────────────────────────
function useDemoMode() {
  const [jackpot, setJackpot] = useState(0.003);
  const [totalOpened, setTotalOpened] = useState(0);

  const simulateOpen = useCallback((currentJackpot) => {
    const result = rollReward(currentJackpot);
    const contribution = BOX_PRICE * JACKPOT_CONTRIBUTION;

    setTotalOpened(prev => prev + 1);
    setJackpot(prev => {
      if (result.isJackpot) return 0.003; // Reset jackpot after win
      return parseFloat((prev + contribution).toFixed(5));
    });
    return result;
  }, []);

  return { jackpot, totalOpened, simulateOpen };
}

export default function App() {
  const wallet = useWallet();
  const contract = useContract(wallet.address);
  const demo = useDemoMode();

  const [isOpening, setIsOpening] = useState(false);
  const [lastResult, setLastResult] = useState(null); // { token, tier, reward, isJackpot }
  const [history, setHistory] = useState([]);

  // On-chain stats
  const jackpot = parseFloat(contract.jackpot ?? 0);
  const totalOpened = contract.totalOpened ?? 0;

  const handleOpen = useCallback(async () => {
    if (isOpening) return;
    setIsOpening(true);
    setLastResult(null);

    let result;

    if (contract.isDeployed && wallet.address) {
      // ── On-chain open ──────────────────────────────────────────────
      await new Promise(r => setTimeout(r, TOTAL_ANIMATION_MS));
      const raw = await contract.openBoxOnChain();
      if (raw) {
        const tierMap = { 0: TIERS.COMMON, 1: TIERS.RARE, 2: TIERS.LEGENDARY };
        const tier = tierMap[raw.tier] ?? TIERS.COMMON;
        const { TOKENS } = await import('./config/tokens');
        const token = TOKENS.find(t => t.symbol === raw.tokenSymbol) ?? TOKENS[0];
        result = { token, tier, reward: parseFloat(raw.reward), isJackpot: raw.isJackpot ?? false };
      }
    } else {
      // ── Local Simulation (Fallback) ────────────────────────────────
      // This allows testing the UI even if the contract is not yet deployed
      await new Promise(r => setTimeout(r, TOTAL_ANIMATION_MS));
      result = rollReward(0.003); // Simulate with a mock jackpot
    }

    if (result) {
      setLastResult(result);
      setHistory(prev => [{ ...result, timestamp: Date.now() }, ...prev]);
    }
    setIsOpening(false);
  }, [isOpening, contract, wallet.address]);

  const handlePlayAgain = useCallback(() => {
    setLastResult(null);
  }, []);

  // Merge contract history with local simulation results
  const displayHistory = useMemo(() => {
    // If not deployed, use local history
    if (!contract.isDeployed) return history;
    
    // Map contract events to the UI format
    const events = (contract.recentHistory || []).map(item => {
      if (!item) return null;
      const tierMap = { 0: TIERS.COMMON, 1: TIERS.RARE, 2: TIERS.LEGENDARY };
      const tier = tierMap[item.tier] || TIERS.COMMON;
      const token = TOKENS.find(t => t.symbol === item.tokenSymbol) || TOKENS[0];
      
      return {
        ...item,
        tier,
        token,
        reward: parseFloat(item.reward || 0)
      };
    }).filter(Boolean);

    return [...events, ...history];
  }, [contract.recentHistory, contract.isDeployed, history]);

  return (
    <div className="app-root">
      {/* Animated background stars */}
      <div className="stars" aria-hidden="true">
        {[...Array(60)].map((_, i) => (
          <div key={i} className={`star star-${(i % 3) + 1}`} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🎁</span>
          <div>
            <h1 className="app-title">Mystery Box</h1>
            <p className="app-subtitle">on Base</p>
            <a href="https://x.com/rxjax007" target="_blank" rel="noopener noreferrer" className="dev-link">
              by @rxjax007
            </a>
          </div>
        </div>

        <WalletBar wallet={wallet} onConnect={wallet.connect} />
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="app-main">
        {/* Left column: jackpot + history */}
        <aside className="app-aside">
          <JackpotPool jackpot={jackpot} totalOpened={totalOpened} />
          
          {wallet.address && (
            <div className="claim-panel glass-panel">
              <div className="claim-header">
                <span>🎁</span>
                <span className="claim-title">My Rewards</span>
              </div>
              <div className="claim-amount">
                <span className="claim-value">{parseFloat(contract.claimableBalance).toFixed(8)}</span>
                <span className="claim-unit">ETH</span>
              </div>
              <button 
                className="btn btn--claim" 
                onClick={contract.claimRewardsOnChain}
                disabled={contract.isLoading || parseFloat(contract.claimableBalance) === 0}
              >
                {contract.isLoading ? 'Claiming...' : 'Claim to Wallet'}
              </button>
              <p className="claim-hint">Rewards are collected here after opening boxes.</p>
            </div>
          )}

          <RewardHistory history={displayHistory} />
        </aside>

        {/* Center: mystery box */}
        <section className="app-center">
          {/* Network Enforcement Overlay */}
          {wallet.address && !wallet.isCorrectChain && (
            <div className="network-warning">
              <div className="network-warning-content">
                <span className="network-icon">🌐</span>
                <h2 className="network-title">Network Switch Required</h2>
                <p className="network-message">
                  {wallet.isEthereumMainnet 
                    ? "You are currently on Ethereum mainnet, please switch to Base network to continue."
                    : "Base network is required to play. Please switch your wallet to Base L2."}
                </p>
                <button className="btn btn--switch" onClick={wallet.switchToBase} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  ⚡ Switch to Base
                </button>
              </div>
            </div>
          )}

          {lastResult ? (
            <RewardReveal result={lastResult} onPlayAgain={handlePlayAgain} />
          ) : (
            <MysteryBox
              onOpen={handleOpen}
              isOpening={isOpening}
              wallet={wallet}
              boxPrice={BOX_PRICE}
            />
          )}
        </section>

        {/* Right column: tier guide */}
        <aside className="app-aside app-aside--right">
          <div className="tier-guide glass-panel">
            <div className="tier-guide-header">
              <span>🎲</span>
              <span>Reward Tiers</span>
            </div>
            <div className="tier-row tier-row--common">
              <span className="tier-dot" style={{ background: '#22d3ee' }} />
              <div className="tier-info">
                <span className="tier-name">Common</span>
              </div>
              <span className="tier-reward">0.0000005–0.0001 ETH</span>
            </div>
            <div className="tier-row tier-row--rare">
              <span className="tier-dot" style={{ background: '#a855f7' }} />
              <div className="tier-info">
                <span className="tier-name">Rare</span>
              </div>
              <span className="tier-reward">0.001–0.01 ETH</span>
            </div>
            <div className="tier-row tier-row--legendary">
              <span className="tier-dot" style={{ background: '#f7c94f' }} />
              <div className="tier-info">
                <span className="tier-name">Legendary ⚡</span>
              </div>
              <span className="tier-reward">Jackpot!</span>
            </div>

            <div className="tier-price-info">
              <span>Box price:</span>
              <strong>{BOX_PRICE} ETH</strong>
            </div>
          </div>

          <StatsBar history={displayHistory} />
        </aside>
      </main>
    </div>
  );
}
