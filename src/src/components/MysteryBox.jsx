import React, { useState, useEffect, useRef } from 'react';
import { TIERS, TIER_CONFIG, TOKENS } from '../config/tokens';

const SPIN_DURATION_MS = 2200;
const CRACK_DURATION_MS = 400;

// States: idle | shaking | cracking | revealing | done
export default function MysteryBox({ onOpen, isOpening, isDisabled, boxPrice }) {
  const [phase, setPhase] = useState('idle');
  const spinRef = useRef(null);

  // Reset when a new open cycle starts
  useEffect(() => {
    if (isOpening) {
      setPhase('shaking');
      const t1 = setTimeout(() => setPhase('cracking'), SPIN_DURATION_MS);
      const t2 = setTimeout(() => setPhase('exploding'), SPIN_DURATION_MS + CRACK_DURATION_MS);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      // After reveal is done and parent resets, go back to idle
      if (phase === 'exploding') {
        const t = setTimeout(() => setPhase('idle'), 300);
        return () => clearTimeout(t);
      }
    }
  }, [isOpening]);

  const handleClick = () => {
    if (isDisabled || isOpening) return;
    onOpen();
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
          <div className="box-lid-inner">
            <span className="box-question">?</span>
          </div>
          {/* Lid shine */}
          <div className="box-lid-shine" />
        </div>

        {/* Body */}
        <div className="box-body">
          <div className="box-body-pattern" />
          {/* Cracks (shown during crack phase) */}
          {(phase === 'cracking' || phase === 'exploding') && (
            <div className="box-cracks">
              <div className="crack crack-1" />
              <div className="crack crack-2" />
              <div className="crack crack-3" />
            </div>
          )}
        </div>

        {/* Particles (shown during explode) */}
        {phase === 'exploding' && (
          <div className="box-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`} />
            ))}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        className={`btn-open-box ${isOpening ? 'btn-open-box--loading' : ''}`}
        onClick={handleClick}
        disabled={isDisabled || isOpening}
      >
        {isOpening ? (
          <span className="btn-open-text">
            <span className="spin-dots">
              <span /><span /><span />
            </span>
            Opening…
          </span>
        ) : (
          <span className="btn-open-text">
            🎁 Open Mystery Box
            <span className="btn-price">{boxPrice} ETH</span>
          </span>
        )}
      </button>

      <p className="box-hint">
        {isOpening ? 'Revealing your reward…' : 'Tap to open and discover your reward'}
      </p>
    </div>
  );
}
