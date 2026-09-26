import React, { useState, useEffect } from 'react';

export default function FabricLoupe({ 
  isActive = false, 
  activeBeat = 0,
  onClose 
}) {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  if (!isActive) return null;

  // Grain description changes based on active beat
  const grainSpecs = [
    { title: '70D CRINKLE RIPSTOP NYLON', detail: 'Grid spacing: 5mm x 5mm · DWR fluorocarbon-free finish · Garment-washed' },
    { title: 'SEAM INTERSECTION BIAS', detail: '45° cut angle · Bonded nylon 40 thread · 11.5 stitches per inch' },
    { title: 'HEAT-SEALED POLYURETHANE TAPE', detail: '22mm clear hot-melt tape · Zero needle hole moisture penetration' },
    { title: 'BRUSHED NICKEL HARDWARE', detail: 'YKK #5 vislon teeth · Zinc alloy puller with anti-slip micro knurling' },
    { title: 'WOVEN DAMASK LABEL GRAIN', detail: 'High-density polyester warp · Overlocked edges · Hand-sewn 4-corner tack' },
    { title: 'RE-TENSIONED RUNNING SEAM', detail: 'Lockstitch 301 · 12 SPI · High-tensile bar tacks at stress points' }
  ];

  const currentSpec = grainSpecs[activeBeat] || grainSpecs[0];
  const size = 220;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${pos.x - size / 2}px`,
        top: `${pos.y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 999,
        border: '3px solid #F1EDE6',
        boxShadow: '0 0 0 1px #141312, 0 16px 48px rgba(0, 0, 0, 0.85), inset 0 0 24px rgba(245, 205, 155, 0.25)',
        overflow: 'hidden',
        backgroundColor: '#181715'
      }}
    >
      {/* Simulated 3x Fabric Macro Weave Texture */}
      <div
        className={activeBeat === 2 ? 'mesh-lining-texture' : 'ripstop-texture'}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: activeBeat === 1 ? '#D5222B' : (activeBeat === 2 ? '#22252a' : '#141312'),
          transform: 'scale(1.8)',
          opacity: 0.95
        }}
      />

      {/* Reticle Crosshair & Measurement Marks */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="none" stroke="rgba(241, 237, 230, 0.2)" strokeWidth="1" />
        <circle cx={size / 2} cy={size / 2} r={size / 4} fill="none" stroke="rgba(241, 237, 230, 0.15)" strokeWidth="0.8" strokeDasharray="3 3" />
        
        {/* Crosshair lines */}
        <line x1={size / 2} y1={10} x2={size / 2} y2={size - 10} stroke="rgba(213, 34, 43, 0.65)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={10} y1={size / 2} x2={size - 10} y2={size / 2} stroke="rgba(213, 34, 43, 0.65)" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Center reticle dot */}
        <circle cx={size / 2} cy={size / 2} r="2.5" fill="#D5222B" />
      </svg>

      {/* Grain Spec Overlay at bottom of lens */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          textAlign: 'center',
          backgroundColor: 'rgba(20, 19, 18, 0.88)',
          padding: '4px 6px',
          borderRadius: '2px',
          border: '1px dashed rgba(241, 237, 230, 0.3)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#D5222B', fontWeight: 'bold' }}>
          3X GRAIN LOUPE
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.60rem', color: '#F1EDE6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentSpec.title}
        </div>
      </div>
    </div>
  );
}
