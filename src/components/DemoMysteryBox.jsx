import React, { useState, useEffect, useRef } from 'react';
import { TIERS, TOKENS } from '../config/tokens';

const SPIN_DURATION_MS = 2200;
const CRACK_DURATION_MS = 400;

export default function DemoMysteryBox({ onOpen, isOpening }) {
  const [phase, setPhase] = useState('idle');
  const spinRef = useRef(null);

  // We'll use ETH as the example token on the box
  const exampleToken = TOKENS.find(t => t.symbol === 'ETH') || TOKENS[0];

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
    return (
      <span className="btn-open-text">
        🎁 Open Demo Box
        <span className="btn-price">FREE</span>
      </span>
    );
  };

  const boxClass = [
    'mystery-box',
    'mystery-box--demo',
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
             {/* Example Token on Lid */}
             <img 
               src={`/tokens/${exampleToken.file}`} 
               alt="Example Token" 
               style={{ 
                 width: '32px', 
                 height: '32px', 
                 opacity: 0.6, 
                 filter: 'grayscale(1) brightness(0.5)',
                 position: 'absolute',
                 top: '10px',
                 left: '12px'
               }} 
             />
             <span className="box-question">?</span>
             <img 
               src={`/tokens/${exampleToken.file}`} 
               alt="Example Token" 
               style={{ 
                 width: '32px', 
                 height: '32px', 
                 opacity: 0.6, 
                 filter: 'grayscale(1) brightness(0.5)',
                 position: 'absolute',
                 bottom: '10px',
                 right: '12px'
               }} 
             />
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
        className={`btn-open-box ${isOpening ? 'btn-open-box--loading' : ''}`}
        onClick={handleClick}
        disabled={isOpening}
      >
        {getButtonContent()}
      </button>

      <p className="box-hint">
        {isOpening ? 'Revealing your reward…' : 'Tap to try the demo for free!'}
      </p>
    </div>
  );
}
