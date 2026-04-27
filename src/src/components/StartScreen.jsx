import React, { useState } from 'react';

export default function StartScreen({ onStart }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="flex-center" style={{ flex: 1, padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <img 
          src="/logo.png" 
          alt="Crypto Crush Logo" 
          style={{ width: '120px', height: '120px', marginBottom: '20px', borderRadius: '24px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} 
        />
        <h1 className="text-gradient" style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>Crypto Crush</h1>
        <p style={{ color: '#475569', marginBottom: '30px' }}>Match 3 or more coins!</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Username</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Enter your name..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="glass-button" style={{ width: '100%' }}>
            Start Game
          </button>
        </form>

        <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
          <a 
            href="https://x.com/rxjax007" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Follow @rxjax007
          </a>
        </div>
      </div>
    </div>
  );
}
