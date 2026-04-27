import React, { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const start = prevRef.current;
    const end = target;
    if (start === end) return;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(parseFloat((start + (end - start) * eased).toFixed(5)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    prevRef.current = end;
  }, [target, duration]);

  return display;
}

export default function JackpotPool({ jackpot, totalOpened }) {
  const displayed = useCountUp(jackpot, 1000);
  const isHot = jackpot >= 0.01;

  return (
    <div className={`jackpot-panel glass-panel ${isHot ? 'jackpot-panel--hot' : ''}`}>
      {/* Header */}
      <div className="jackpot-header">
        <span className="jackpot-icon">{isHot ? '🔥' : '💰'}</span>
        <span className="jackpot-title">Jackpot Pool</span>
        {isHot && <span className="jackpot-hot-badge">HOT</span>}
      </div>

      {/* Amount */}
      <div className="jackpot-amount">
        <span className="jackpot-eth">{displayed.toFixed(5)}</span>
        <span className="jackpot-unit">ETH</span>
      </div>

      {/* Sub-label */}
      <p className="jackpot-sublabel">
        {isHot
          ? '⚡ Legendary pull could win this entire pool!'
          : 'Grows with every box opened'}
      </p>

      {/* Progress bar — visual only, represents pool size */}
      {totalOpened > 0 && (
        <div className="jackpot-bar-wrap">
          <div
            className="jackpot-bar"
            style={{ width: `${Math.min((jackpot / 0.05) * 100, 100)}%` }}
          />
        </div>
      )}

      {totalOpened !== null && (
        <div className="jackpot-stat">
          <span>{totalOpened.toLocaleString()}</span>
          <span className="jackpot-stat-label"> boxes opened total</span>
        </div>
      )}
    </div>
  );
}
