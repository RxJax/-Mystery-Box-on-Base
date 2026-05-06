import React, { useState, useCallback, useMemo } from 'react';
import { rollDemoReward, BOX_PRICE, JACKPOT_CONTRIBUTION } from './utils/rewards';
import { TIERS, TOKENS } from './config/tokens';
import DemoMysteryBox from './components/DemoMysteryBox';
import RewardReveal from './components/RewardReveal';
import JackpotPool from './components/JackpotPool';
import RewardHistory from './components/RewardHistory';
import StatsBar from './components/StatsBar';
import './index.css';

const TOTAL_ANIMATION_MS = 2800;

function useDemoMode() {
  const [jackpot, setJackpot] = useState(0.003);
  const [totalOpened, setTotalOpened] = useState(0);

  const simulateOpen = useCallback((currentJackpot) => {
    const result = rollDemoReward(currentJackpot);
    const contribution = BOX_PRICE * JACKPOT_CONTRIBUTION;

    setTotalOpened(prev => prev + 1);
    setJackpot(prev => {
      if (result.isJackpot) return 0.003; 
      return parseFloat((prev + contribution).toFixed(5));
    });
    return result;
  }, []);

  return { jackpot, totalOpened, simulateOpen };
}

export default function DemoApp() {
  const demo = useDemoMode();
  const [isOpening, setIsOpening] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleOpen = useCallback(async () => {
    if (isOpening) return;
    setIsOpening(true);
    setLastResult(null);

    await new Promise(r => setTimeout(r, TOTAL_ANIMATION_MS));
    const result = demo.simulateOpen(demo.jackpot);

    if (result) {
      setLastResult(result);
      setHistory(prev => [{ ...result, timestamp: Date.now() }, ...prev]);
    }
    setIsOpening(false);
  }, [isOpening, demo]);

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
            <h1 className="app-title">Mystery Box <span style={{ color: '#f7c94f', fontSize: '0.6em', verticalAlign: 'middle', marginLeft: '8px', border: '1px solid #f7c94f44', padding: '2px 8px', borderRadius: '4px' }}>DEMO</span></h1>
            <p className="app-subtitle">Free Simulation Mode</p>
            <a href="https://x.com/rxjax007" target="_blank" rel="noopener noreferrer" className="dev-link">
              by @rxjax007
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="glass-panel" style={{ padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600', color: '#4ade80', border: '1px solid #4ade8044' }}>
            🎮 Play for Free
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="app-main">
        {/* Left column: jackpot + history */}
        <aside className="app-aside">
          <JackpotPool jackpot={demo.jackpot} totalOpened={demo.totalOpened} />
          <RewardHistory history={history} />
        </aside>

        {/* Center: mystery box */}
        <section className="app-center">
          {lastResult ? (
            <RewardReveal result={lastResult} onPlayAgain={handlePlayAgain} />
          ) : (
            <DemoMysteryBox
              onOpen={handleOpen}
              isOpening={isOpening}
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
              <strong>FREE</strong>
            </div>
          </div>

          <StatsBar history={history} />
        </aside>
      </main>
    </div>
  );
}
