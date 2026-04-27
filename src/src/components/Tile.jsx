import React from 'react';

export default function Tile({
  type,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isBlasting,
  isComet,
  size
}) {
  if (!type) return <div style={{ width: size, height: size, margin: 2 }} />;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      className={`${isBlasting ? 'blast-animation' : ''} ${isComet ? 'comet-animation' : ''}`}
      style={{
        width: size - 4, // 2px margin on each side
        height: size - 4,
        margin: 2,
        borderRadius: '16px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1), inset 0 2px 10px rgba(255,255,255,0.5)',
        cursor: 'grab',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.4)',
        transition: 'transform 0.2s',
        overflow: 'hidden',
        touchAction: 'none' // Prevent scrolling on touch
      }}
    >
      {/* Shiny overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))',
        borderRadius: '16px 16px 0 0',
        pointerEvents: 'none'
      }} />
      <img 
        src={`/${type}`} 
        alt="coin" 
        style={{ width: '80%', height: '80%', objectFit: 'contain', pointerEvents: 'none' }} 
      />
    </div>
  );
}
