import React from 'react';
import { TIERS } from '../config/tokens';

export default function StatsBar({ history }) {
  const total = history.length;
  const biggestWin = history.length > 0
    ? Math.max(...history.map(h => h.reward))
    : 0;

  // Win streak: consecutive non-common results at the end
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].tier !== TIERS.COMMON) streak++;
    else break;
  }

  const legCount = history.filter(h => h.tier === TIERS.LEGENDARY).length;

  return (
    <div className="stats-bar" style={{ position: 'relative' }}>
      <div 
        className="stats-info-guide stats-info-guide--mini" 
        title="Stats for boxes opened and streaks reset every 24 hours automatically."
        style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px', border: 'none', background: 'transparent' }}
      >
        <span className="stats-info-icon" style={{ width: '16px', height: '16px', fontSize: '0.65rem' }}>ⓘ</span>
      </div>

      <div className="stat-item">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Boxes Opened</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value stat-value--gold">
          {biggestWin > 0 ? `${biggestWin.toFixed(8)}` : '—'}
        </span>
        <span className="stat-label">Best Win (ETH)</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value stat-value--purple">{legCount}</span>
        <span className="stat-label">Legendaries</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className={`stat-value ${streak > 0 ? 'stat-value--streak' : ''}`}>
          {streak > 0 ? `🔥 ${streak}` : '—'}
        </span>
        <span className="stat-label">Hot Streak</span>
      </div>
    </div>
  );
}
