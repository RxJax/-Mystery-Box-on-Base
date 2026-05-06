import React from 'react';
import { TIERS } from '../config/tokens';

export default function StatsBar({ history }) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // Filter history for the last 24 hours for Boxes Opened and Legendaries
  const recentHistory = history.filter(h => now - h.timestamp < oneDay);
  
  const total = recentHistory.length;
  const biggestWin = recentHistory.length > 0
    ? Math.max(...recentHistory.map(h => h.reward))
    : 0;
  const legCount = recentHistory.filter(h => h.tier === TIERS.LEGENDARY).length;

  // ─── Daily Hot Streak Calculation ───────────────────────────────────────
  // A streak is the number of consecutive days with at least one box opened.
  const getStreak = () => {
    if (history.length === 0) return 0;

    // Get unique days (YYYY-MM-DD) from history
    const daysWithActivity = new Set(
      history.map(h => new Date(h.timestamp).toISOString().split('T')[0])
    );
    const sortedDays = Array.from(daysWithActivity).sort((a, b) => b.localeCompare(a));

    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // If no activity today AND no activity yesterday, streak is broken
    if (!daysWithActivity.has(today) && !daysWithActivity.has(yesterday)) return 0;

    let currentStreak = 0;
    let checkDate = daysWithActivity.has(today) ? new Date(today) : new Date(yesterday);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (daysWithActivity.has(dateStr)) {
        currentStreak++;
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const streak = getStreak();

  return (
    <div className="stats-bar" style={{ position: 'relative' }}>
      <div 
        className="stats-info-guide stats-info-guide--mini" 
        title="Boxes opened and wins reset every 24 hours. Hot Streak increases if you open at least one box every day; failing to play for a day resets it to 0."
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
