import React, { useState, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
  const [demoMode] = useState(true); // Flip to false once contract is deployed

  // Effective jackpot: prefer on-chain, fall back to demo
  const jackpot = !demoMode && contract.isDeployed
    ? parseFloat(contract.jackpot ?? 0)
    : demo.jackpot;
  const totalOpened = !demoMode && contract.isDeployed
    ? contract.totalOpened
    : demo.totalOpened;

  const handleOpen = useCallback(async () => {
    if (isOpening) return;
    setIsOpening(true);
    setLastResult(null);

    let result;

    if (!demoMode && contract.isDeployed && wallet.address) {
      // ── On-chain open ──────────────────────────────────────────────
      // Wait for animation then fire transaction
      await new Promise(r => setTimeout(r, TOTAL_ANIMATION_MS));
      const raw = await contract.openBoxOnChain();
      if (raw) {
        // Map tier index (0/1/2) → tier string
        const tierMap = { 0: TIERS.COMMON, 1: TIERS.RARE, 2: TIERS.LEGENDARY };
        const tier = tierMap[raw.tier] ?? TIERS.COMMON;
        // Find matching token by symbol
        const { TOKENS } = await import('./config/tokens');
        const token = TOKENS.find(t => t.symbol === raw.tokenSymbol) ?? TOKENS[0];
        result = { token, tier, reward: parseFloat(raw.reward), isJackpot: raw.isJackpot ?? false };
      } else {
        // Transaction failed — fall back to demo roll so the UI doesn't stall
        result = demo.simulateOpen(demo.jackpot);
      }
    } else {
      // ── Demo simulation ────────────────────────────────────────────
      await new Promise(r => setTimeout(r, TOTAL_ANIMATION_MS));
      result = demo.simulateOpen(demo.jackpot);
    }

    setLastResult(result);
    setHistory(prev => [...prev, { ...result, timestamp: Date.now() }]);
    setIsOpening(false);
  }, [isOpening, demoMode, contract, wallet.address, demo]);

  const handlePlayAgain = useCallback(() => {
    setLastResult(null);
  }, []);

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
          </div>
        </div>

        <WalletBar wallet={wallet} onConnect={wallet.connect} />
      </header>

      {/* Demo mode banner */}
      {demoMode && (
        <div className="demo-banner">
          🎮 Demo Mode — No real ETH required. Deploy the contract to play on-chain!
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="app-main">
        {/* Left column: jackpot + history */}
        <aside className="app-aside">
          <JackpotPool jackpot={jackpot} totalOpened={totalOpened} />
          <RewardHistory history={history} />
        </aside>

        {/* Center: mystery box */}
        <section className="app-center">
          {lastResult ? (
            <RewardReveal result={lastResult} onPlayAgain={handlePlayAgain} />
          ) : (
            <MysteryBox
              onOpen={handleOpen}
              isOpening={isOpening}
              isDisabled={false}
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
                <span className="tier-chance">70% chance</span>
              </div>
              <span className="tier-reward">0.0001–0.001 ETH</span>
            </div>
            <div className="tier-row tier-row--rare">
              <span className="tier-dot" style={{ background: '#a855f7' }} />
              <div className="tier-info">
                <span className="tier-name">Rare</span>
                <span className="tier-chance">20% chance</span>
              </div>
              <span className="tier-reward">0.001–0.01 ETH</span>
            </div>
            <div className="tier-row tier-row--legendary">
              <span className="tier-dot" style={{ background: '#f7c94f' }} />
              <div className="tier-info">
                <span className="tier-name">Legendary ⚡</span>
                <span className="tier-chance">10% chance</span>
              </div>
              <span className="tier-reward">Jackpot!</span>
            </div>

            <div className="tier-price-info">
              <span>Box price:</span>
              <strong>{BOX_PRICE} ETH</strong>
            </div>
          </div>

          <StatsBar history={history} />
        </aside>
      </main>
      <Analytics />
    </div>
  );
}
