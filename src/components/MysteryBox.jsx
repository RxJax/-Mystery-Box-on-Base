import React, { useState, useEffect, useRef } from 'react';
import { TIERS, TIER_CONFIG, TOKENS } from '../config/tokens';

const SPIN_DURATION_MS = 2200;
const CRACK_DURATION_MS = 400;

// States: idle | shaking | cracking | revealing | done
export default function MysteryBox({ onOpen, isOpening, wallet, boxPrice, isDemoMode }) {
  const [phase, setPhase] = useState('idle');
  const spinRef = useRef(null);

  const isConnected = !!wallet.address;
  const isCorrectChain = wallet.isCorrectChain;
  const isDisabled = isOpening;

  // Reset when a new open cycle starts
  useEffect(() => {
    if (isOpening) {
      setPhase('shaking');
      const t1 = setTimeout(() => setPhase('cracking'), SPIN_DURATION_MS);
      const t2 = setTimeout(() => setPhase('exploding'), SPIN_DURATION_MS + CRACK_DURATION_MS);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      if (phase === 'exploding') {
        const t = setTimeout(() => setPhase('idle'), 300);
        return () => clearTimeout(t);
      }
    }
  }, [isOpening, phase]);

  const handleClick = () => {
    if (isOpening) return;
    
    if (!isDemoMode) {
      if (!isConnected) {
        wallet.connect();
        return;
      }

      if (!isCorrectChain) {
        wallet.switchToBase();
        return;
      }
    }

    onOpen();
  };

  const getButtonContent = () => {
    if (isOpening) {
      return (
        <span className="btn-open-text">
          <span className="spin-dots"><span /><span /><span /></span>
          Opening…
        </span>
      );
    }
    if (!isDemoMode && !isConnected) {
      return <span className="btn-open-text">🔌 Connect Wallet to Play</span>;
    }
    if (!isDemoMode && !isCorrectChain) {
      return <span className="btn-open-text">⚡ Switch to Base Network</span>;
    }
    return (
      <span className="btn-open-text">
        🎁 {isDemoMode ? 'Open Demo Box' : 'Open Mystery Box'}
        <span className="btn-price">{isDemoMode ? 'FREE' : `${boxPrice} ETH`}</span>
      </span>
    );
  };

  const boxClass = [
    'mystery-box',
    phase === 'shaking' ? 'mystery-box--shaking' : '',
    phase === 'cracking' ? 'mystery-box--cracking' : '',
    phase === 'exploding' ? 'mystery-box--exploding' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="mystery-box-wrap">
      {/* Glow ring behind the box */}
      <div className={`box-glow-ring ${isOpening ? 'box-glow-ring--active' : ''}`} />

      {/* The Box */}
      <div className={boxClass} onClick={handleClick} ref={spinRef}>
        {/* Lid */}
        <div className="box-lid">
          <div className="box-lid-inner" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isDemoMode && (
              <>
                <img 
                  src={`/tokens/${TOKENS.find(t => t.symbol === 'ETH')?.file || 'ethereum-eth-logo.png'}`} 
                  alt="" 
                  style={{ width: '28px', height: '28px', opacity: 0.4, filter: 'grayscale(1) brightness(0.5)', position: 'absolute', top: '8px', left: '10px' }} 
                />
                <img 
                  src={`/tokens/${TOKENS.find(t => t.symbol === 'BTC')?.file || 'bitcoin-btc-logo.png'}`} 
                  alt="" 
                  style={{ width: '28px', height: '28px', opacity: 0.4, filter: 'grayscale(1) brightness(0.5)', position: 'absolute', bottom: '8px', right: '10px' }} 
                />
              </>
            )}
            <span className="box-question">?</span>
          </div>
          <div className="box-lid-shine" />
        </div>

        {/* Body */}
        <div className="box-body">
          <div className="box-body-pattern" />
          {(phase === 'cracking' || phase === 'exploding') && (
            <div className="box-cracks">
              <div className="crack crack-1" /><div className="crack crack-2" /><div className="crack crack-3" />
            </div>
          )}
        </div>

        {phase === 'exploding' && (
          <div className="box-particles">
            {[...Array(12)].map((_, i) => <div key={i} className={`particle particle-${i + 1}`} />)}
          </div>
        )}
      </div>

      <button
        className={`btn-open-box ${isOpening ? 'btn-open-box--loading' : ''} ${(!isDemoMode && (!isConnected || !isCorrectChain)) ? 'btn-open-box--warning' : ''}`}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {getButtonContent()}
      </button>

      {wallet.error && (
        <div className="box-error" style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
          ⚠️ {wallet.error}
        </div>
      )}

      <p className="box-hint">
        {isDemoMode ? (isOpening ? 'Revealing your reward…' : 'Tap to try the demo for free!') : (!isConnected ? 'Wallet connection required' : !isCorrectChain ? 'Please switch to Base L2' : isOpening ? 'Revealing your reward…' : 'Tap to open and discover your reward')}
      </p>
    </div>
  );
}
