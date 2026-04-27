import React, { useState, useRef, useEffect } from 'react';
import Tile from './Tile';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../logic/GameEngine';

export default function GameBoard({ board, onSwap, blastingPositions, cometEffects }) {
  const [draggedTile, setDraggedTile] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const boardRef = useRef(null);
  const [tileSize, setTileSize] = useState(40);

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const width = boardRef.current.clientWidth;
        setTileSize(Math.floor(width / BOARD_WIDTH));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Mouse Drag Events
  const handleDragStart = (r, c) => {
    setDraggedTile({ r, c });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (r, c) => {
    if (!draggedTile) return;
    const { r: r1, c: c1 } = draggedTile;
    
    // Ensure it's an adjacent tile
    const isAdjacent = (Math.abs(r1 - r) === 1 && c1 === c) || (Math.abs(c1 - c) === 1 && r1 === r);
    if (isAdjacent) {
      onSwap(r1, c1, r, c);
    }
    setDraggedTile(null);
  };

  // Touch Events (Swipe)
  const handleTouchStart = (e, r, c) => {
    setDraggedTile({ r, c });
    setTouchStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e, r, c) => {
    if (!draggedTile || !touchStartPos) return;
    const touchEndPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    
    const dx = touchEndPos.x - touchStartPos.x;
    const dy = touchEndPos.y - touchStartPos.y;
    
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      // Too small to be a swipe
      setDraggedTile(null);
      setTouchStartPos(null);
      return;
    }

    let targetR = r;
    let targetC = c;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      targetC = dx > 0 ? c + 1 : c - 1;
    } else {
      // Vertical swipe
      targetR = dy > 0 ? r + 1 : r - 1;
    }

    if (targetR >= 0 && targetR < BOARD_HEIGHT && targetC >= 0 && targetC < BOARD_WIDTH) {
      onSwap(r, c, targetR, targetC);
    }

    setDraggedTile(null);
    setTouchStartPos(null);
  };

  const isBlasting = (r, c) => {
    return blastingPositions.has(`${r},${c}`);
  };

  const getCometEffect = (r, c) => {
    const effect = cometEffects.find(eff => eff.center.r === r && eff.center.c === c);
    return effect ? (effect.type === 'row' ? 'comet-row' : 'comet-col') : null;
  };

  return (
    <div 
      ref={boardRef}
      className="glass-panel"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
        width: '100%',
        maxWidth: '400px', // Max size for desktop, will scale down on mobile
        aspectRatio: '1/1',
        padding: '8px',
        boxSizing: 'border-box',
        touchAction: 'none'
      }}
    >
      {board.map((row, r) => (
        row.map((tile, c) => (
          <Tile
            key={tile?.id || `empty-${r}-${c}`}
            type={tile?.type}
            size={tileSize}
            isBlasting={isBlasting(r, c)}
            isComet={getCometEffect(r, c)}
            onDragStart={() => handleDragStart(r, c)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(r, c)}
            onTouchStart={(e) => handleTouchStart(e, r, c)}
            onTouchEnd={(e) => handleTouchEnd(e, r, c)}
          />
        ))
      ))}
    </div>
  );
}
