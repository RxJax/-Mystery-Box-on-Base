import React from 'react';

export default function TopBar({ score, targetScore, movesLeft, level, onPause }) {
  const progress = Math.min((score / targetScore) * 100, 100);

  return (
    <div className="glass-panel" style={{ 
      width: '100%', 
      maxWidth: '400px', 
      padding: '16px', 
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Level {level}</h2>
          <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
            Moves: <span style={{ color: movesLeft <= 5 ? '#ef4444' : '#0ea5e9' }}>{movesLeft}</span>
          </div>
        </div>
        
        <button 
          onClick={onPause}
          className="glass-button"
          style={{ padding: '8px 12px', fontSize: '1.2rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          ⚙️
        </button>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#334155', fontWeight: 600 }}>
          <span>Score: {score}</span>
          <span>Target: {targetScore}</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '5px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)' }}>
          <div style={{ 
            height: '100%', 
            width: `${progress}%`, 
            background: 'linear-gradient(90deg, #38bdf8, #3b82f6)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  );
}
