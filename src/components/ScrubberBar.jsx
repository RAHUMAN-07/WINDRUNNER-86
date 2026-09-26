import React, { useState, useEffect } from 'react';

const BEATS = [
  { id: 0, tag: '01', name: 'HERO', target: 0.05 },
  { id: 1, tag: '02', name: 'SHELL', target: 0.22 },
  { id: 2, tag: '03', name: 'LINING', target: 0.42 },
  { id: 3, tag: '04', name: 'TRIMS', target: 0.63 },
  { id: 4, tag: '05', name: 'FLAT-LAY', target: 0.82 },
  { id: 5, tag: '06', name: 'RE-STITCH', target: 0.96 }
];

export default function ScrubberBar({
  scrollProgress = 0,
  currentFrame = 0,
  activeBeat = 0,
  onNavigateBeat,
  onToggleLoupe,
  isLoupeActive = false,
  onOpenSpecSheet
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play hands-free scroll scrubber
  useEffect(() => {
    if (!isPlaying) return;

    let animId;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    const step = () => {
      const currentScroll = window.scrollY;
      const speed = 2.5; // smooth auto-advance
      if (currentScroll + speed >= scrollHeight) {
        setIsPlaying(false);
        return;
      }
      window.scrollTo(0, currentScroll + speed);
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: 'calc(100% - 3rem)',
        maxWidth: '1080px',
        backgroundColor: 'rgba(20, 19, 18, 0.92)',
        border: '1px solid rgba(241, 237, 230, 0.14)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '3px',
        padding: '0.65rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        userSelect: 'none'
      }}
    >
      {/* Left: Garment technologist telemetry & stamp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span 
            className="stamped-numeral"
            style={{ fontSize: '0.74rem', letterSpacing: '0.08em', color: '#D5222B' }}
          >
            BENCH RUN · #0286
          </span>
          <span 
            className="font-mono"
            style={{ fontSize: '0.70rem', color: 'rgba(241, 237, 230, 0.55)' }}
          >
            FRM {String(currentFrame).padStart(3, '0')}/120 · {(scrollProgress * 100).toFixed(0)}%
          </span>
        </div>

        <div style={{ width: '1px', height: '26px', backgroundColor: 'rgba(241, 237, 230, 0.15)' }} />

        {/* Auto-play toggle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Auto-Sequence' : 'Auto-Deconstruct Garment'}
          style={{
            background: isPlaying ? 'rgba(213, 34, 43, 0.2)' : 'rgba(241, 237, 230, 0.06)',
            border: isPlaying ? '1px solid #D5222B' : '1px solid rgba(241, 237, 230, 0.18)',
            color: isPlaying ? '#D5222B' : '#F1EDE6',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            padding: '4px 8px',
            borderRadius: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.2s ease'
          }}
        >
          {isPlaying ? (
            <>
              <span style={{ fontSize: '0.7rem' }}>❚❚</span> PAUSE
            </>
          ) : (
            <>
              <span style={{ fontSize: '0.7rem' }}>▶</span> UNPICK
            </>
          )}
        </button>
      </div>

      {/* Center: Stage Pills */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.35rem',
          flex: 1,
          justifyContent: 'center',
          maxWidth: '620px'
        }}
      >
        {BEATS.map((beat) => {
          const isActive = activeBeat === beat.id;
          return (
            <button
              key={beat.id}
              onClick={() => onNavigateBeat(beat.id)}
              style={{
                background: isActive ? '#D5222B' : 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(241, 237, 230, 0.65)',
                border: isActive ? '1px solid #D5222B' : '1px solid transparent',
                borderRadius: '2px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#F1EDE6';
                  e.currentTarget.style.backgroundColor = 'rgba(241, 237, 230, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(241, 237, 230, 0.65)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.5, fontSize: '0.66rem' }}>{beat.tag}</span>
              <span>{beat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Fabric Loupe & Tech Pack actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onToggleLoupe}
          style={{
            background: isLoupeActive ? 'rgba(213, 34, 43, 0.25)' : 'rgba(241, 237, 230, 0.05)',
            border: isLoupeActive ? '1px solid #D5222B' : '1px solid rgba(241, 237, 230, 0.15)',
            color: isLoupeActive ? '#F1EDE6' : 'rgba(241, 237, 230, 0.75)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            padding: '4px 8px',
            borderRadius: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.2s ease'
          }}
          title="Toggle 3x Fabric Grain Magnifier"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          {isLoupeActive ? 'LOUPE ON' : 'GRAIN LOUPE'}
        </button>

        <button
          onClick={onOpenSpecSheet}
          style={{
            background: 'rgba(241, 237, 230, 0.05)',
            border: '1px solid rgba(241, 237, 230, 0.15)',
            color: '#F1EDE6',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            padding: '4px 8px',
            borderRadius: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.2s ease'
          }}
          title="Open Garment Tech Pack"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          TECH PACK
        </button>
      </div>
    </div>
  );
}
