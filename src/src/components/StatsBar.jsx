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
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Boxes Opened</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value stat-value--gold">
          {biggestWin > 0 ? `${biggestWin.toFixed(4)}` : '—'}
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
