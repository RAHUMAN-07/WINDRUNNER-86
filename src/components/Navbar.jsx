import React, { useState, useEffect } from 'react';
import HandJitterHeadline from './HandJitterHeadline';

export default function Navbar({ 
  activeBeat = 0, 
  onNavigateBeat, 
  onOpenShop,
  onOpenSpecSheet 
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'The Shell', beat: 1 },
    { label: 'The Lining', beat: 2 },
    { label: 'The Trims', beat: 3 },
    { label: 'The Label', beat: 4 },
    { label: 'Fit & Care', beat: 5, action: 'spec' }
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        height: '68px',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        backgroundColor: scrolled ? 'rgba(20, 19, 18, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(241, 237, 230, 0.08)' : '1px solid transparent'
      }}
    >
      {/* Left: Wordmark with hand-jittered type & stitched-patch style badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button 
          onClick={() => onNavigateBeat(0)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0
          }}
          title="Return to Assembled Hero"
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <HandJitterHeadline 
              text="RUNNER '86" 
              as="span" 
              style={{ fontSize: '1.65rem', color: '#F1EDE6' }} 
            />
          </div>
        </button>

        {/* Stitched-patch style badge */}
        <div 
          className="spec-tag"
          style={{
            border: '1px dashed rgba(241, 237, 230, 0.35)',
            backgroundColor: '#181715',
            padding: '3px 8px',
            fontSize: '0.68rem',
            color: 'rgba(241, 237, 230, 0.85)',
            userSelect: 'none'
          }}
        >
          <span style={{ color: '#D5222B', fontWeight: 'bold' }}>●</span> STYLE NO. 0286
        </div>
      </div>

      {/* Center: Scroll-linked beats */}
      <nav 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem'
        }}
        aria-label="Garment Construction Stages"
      >
        {navItems.map((item, index) => {
          const isActive = (item.action === 'spec') ? false : activeBeat === item.beat;
          return (
            <button
              key={index}
              onClick={() => {
                if (item.action === 'spec') {
                  onOpenSpecSheet();
                } else {
                  onNavigateBeat(item.beat);
                }
              }}
              className={`chalk-link ${isActive ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: isActive ? '700' : '400',
                padding: '4px 0'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Spec Sheet trigger & Solid red CTA button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenSpecSheet}
          className="chalk-link"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '6px 10px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Tech Pack
        </button>

        <button
          onClick={onOpenShop}
          style={{
            backgroundColor: 'var(--accent-red)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-headline)',
            fontSize: '1.15rem',
            letterSpacing: '0.06em',
            padding: '8px 20px',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 8px rgba(213, 34, 43, 0.35)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b81c24'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-red)'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Shop the Colorway
        </button>
      </div>
    </header>
  );
}
