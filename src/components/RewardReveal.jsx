import React, { useEffect, useRef, useState } from 'react';
import { TIERS, TIER_CONFIG } from '../config/tokens';

// Confetti burst for legendary
function ConfettiBurst() {
  const colors = ['#f7c94f', '#f43f5e', '#a855f7', '#22d3ee', '#4ade80', '#fb923c'];
  return (
    <div className="confetti-container" aria-hidden="true">
      {[...Array(40)].map((_, i) => {
        const color = colors[i % colors.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const size = 6 + Math.random() * 8;
        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              background: color,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        );
      })}
    </div>
  );
}

export default function RewardReveal({ result, onPlayAgain }) {
  const { token, tier, reward, isJackpot } = result;
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG[TIERS.COMMON];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay so the component mounts before animating in
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`reward-reveal ${visible ? 'reward-reveal--in' : ''}`}>
      {/* Legendary confetti burst */}
      {tier === TIERS.LEGENDARY && <ConfettiBurst />}

      {/* Jackpot banner */}
      {isJackpot && (
        <div className="jackpot-banner">
          🏆 JACKPOT WIN! 🏆
        </div>
      )}

      {/* Tier badge */}
      <div
        className="reward-tier-badge"
        style={{ background: cfg.badgeGradient, boxShadow: cfg.glow }}
      >
        {cfg.label}
      </div>

      {/* Token logo */}
      <div
        className="reward-token-wrap"
        style={{ boxShadow: cfg.glow, borderColor: cfg.color + '99' }}
      >
        <img
          src={`/tokens/${token.file}`}
          alt={token.name}
          className="reward-token-img"
          draggable={false}
        />

        {/* Spinning glow ring for legendary */}
        {tier === TIERS.LEGENDARY && (
          <div className="legendary-ring" style={{ borderColor: cfg.color }} />
        )}
      </div>

      {/* Token name */}
      <div className="reward-token-name">
        <span className="reward-symbol" style={{ color: cfg.color }}>{token.symbol}</span>
        <span className="reward-fullname">{token.name}</span>
      </div>

      {/* Reward amount */}
      <div className="reward-amount" style={{ color: cfg.color }}>
        <span className="reward-amount-label">YOU WON</span>
        <span className="reward-amount-value">+{reward} ETH</span>
      </div>

      {/* Play again */}
      <button className="btn btn--play-again" onClick={onPlayAgain}>
        🎁 Open Another Box
      </button>
    </div>
  );
}
