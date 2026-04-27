import React from 'react';
import { TIERS, TIER_CONFIG } from '../config/tokens';

const TIER_ICONS = {
  [TIERS.COMMON]:    '🔵',
  [TIERS.RARE]:      '💜',
  [TIERS.LEGENDARY]: '⚡',
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function RewardHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="history-panel glass-panel">
        <div className="history-header">
          <span className="history-icon">📜</span>
          <span className="history-title">My Reward History</span>
        </div>
        <div className="history-empty">
          <span>No boxes opened yet.</span>
          <span className="history-empty-sub">Your results will appear here!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="history-panel glass-panel">
      <div className="history-header">
        <span className="history-icon">📜</span>
        <span className="history-title">My Reward History</span>
        <span className="history-count">{history.length} opens</span>
      </div>

      <div className="history-list">
        {history.slice().reverse().map((entry, i) => {
          const cfg = TIER_CONFIG[entry.tier];
          return (
            <div
              key={entry.timestamp + i}
              className="history-item"
              style={{ borderLeft: `3px solid ${cfg.color}` }}
            >
              {/* Token logo */}
              <img
                src={`/tokens/${entry.token.file}`}
                alt={entry.token.symbol}
                className="history-logo"
              />

              {/* Info */}
              <div className="history-info">
                <span className="history-symbol" style={{ color: cfg.color }}>
                  {TIER_ICONS[entry.tier]} {entry.token.symbol}
                </span>
                <span className="history-tier">{cfg.label}</span>
              </div>

              {/* Reward */}
              <div className="history-right">
                <span className="history-reward" style={{ color: cfg.color }}>
                  +{entry.reward} ETH
                </span>
                <span className="history-time">{timeAgo(entry.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
