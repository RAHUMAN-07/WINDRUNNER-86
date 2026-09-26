import React, { useState } from 'react';
import HandJitterHeadline from './HandJitterHeadline';

export default function ShopDrawer({ isOpen, onClose }) {
  const [selectedColor, setSelectedColor] = useState('og');
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const colorways = [
    {
      id: 'og',
      name: "OG '86 CHEVRON",
      sub: "Scarlet Red / Pitch Black / Aged Off-White",
      swatches: ['#D5222B', '#111111', '#F1EDE6'],
      desc: "The authentic silhouette cut from 70D washed ripstop nylon with contrast raglan sleeve piping."
    },
    {
      id: 'stealth',
      name: "STEALTH SHADOW",
      sub: "Triple Charcoal / Matte Black / Graphite",
      swatches: ['#1C1B1A', '#0D0D0D', '#4A4A4A'],
      desc: "Subtle monochrome construction. Low-visibility taped seams and gunmetal hardware."
    },
    {
      id: 'alpine',
      name: "ALPINE ROYAL",
      sub: "Olympic Royal / Deep Navy / Sail White",
      swatches: ['#1D4ED8', '#0F172A', '#F8FAFC'],
      desc: "Original vintage high-altitude track colorway with breathable poly-mesh lining."
    }
  ];

  const sizes = [
    { label: 'S', stock: '2 left' },
    { label: 'M', stock: 'In stock' },
    { label: 'L', stock: 'In stock' },
    { label: 'XL', stock: '4 left' },
    { label: 'XXL', stock: 'Low stock' }
  ];

  const currentColor = colorways.find(c => c.id === selectedColor) || colorways[0];

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(10, 9, 8, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#181715',
          borderLeft: '1px solid rgba(241, 237, 230, 0.15)',
          boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.85)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px dashed rgba(241,237,230,0.15)', paddingBottom: '1rem' }}>
            <span className="spec-tag" style={{ border: '1px solid #D5222B', color: '#D5222B' }}>
              CUTTING TABLE ORDER
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(241, 237, 230, 0.5)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              [CLOSE ✕]
            </button>
          </div>

          <HandJitterHeadline 
            text="WINDRUNNER '86" 
            as="h2" 
            style={{ fontSize: '2.4rem', color: '#F1EDE6', marginBottom: '0.25rem' }} 
          />
          <p className="font-mono" style={{ fontSize: '0.82rem', color: 'rgba(241, 237, 230, 0.5)', marginBottom: '1.75rem' }}>
            STYLE NO. 0286 · 70D RIPSTOP NYLON · $186.00
          </p>

          {/* Colorway Selection */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="font-mono" style={{ fontSize: '0.74rem', color: '#F1EDE6', letterSpacing: '0.06em' }}>
                01 // SELECT COLORWAY
              </span>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#D5222B' }}>
                {currentColor.name}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {colorways.map((cw) => {
                const isSelected = selectedColor === cw.id;
                return (
                  <div
                    key={cw.id}
                    onClick={() => setSelectedColor(cw.id)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: isSelected ? 'rgba(213, 34, 43, 0.08)' : 'rgba(20, 19, 18, 0.6)',
                      border: isSelected ? '1px solid #D5222B' : '1px solid rgba(241, 237, 230, 0.12)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div className="font-mono" style={{ fontSize: '0.8rem', color: isSelected ? '#FFFFFF' : '#F1EDE6', fontWeight: isSelected ? '700' : '400' }}>
                        {cw.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(241, 237, 230, 0.5)' }}>
                        {cw.sub}
                      </div>
                    </div>

                    {/* Color Swatch Triad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {cw.swatches.map((sw, i) => (
                        <div
                          key={i}
                          style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: sw,
                            borderRadius: '50%',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="font-mono" style={{ fontSize: '0.74rem', color: '#F1EDE6', letterSpacing: '0.06em' }}>
                02 // SELECT SIZE (RELAXED VINTAGE FIT)
              </span>
              <span className="font-mono" style={{ fontSize: '0.70rem', color: 'rgba(241, 237, 230, 0.45)' }}>
                TRUE TO SPEC
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {sizes.map((s) => {
                const isSelected = selectedSize === s.label;
                return (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    style={{
                      background: isSelected ? '#D5222B' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid #D5222B' : '1px solid rgba(241, 237, 230, 0.15)',
                      color: isSelected ? '#FFFFFF' : '#F1EDE6',
                      padding: '10px 4px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{s.label}</div>
                    <div className="font-mono" style={{ fontSize: '0.62rem', opacity: 0.65 }}>{s.stock}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Perforated Tailor Ticket / Checkout Receipt */}
        <div>
          <div
            style={{
              backgroundColor: '#121211',
              border: '1px dashed rgba(241, 237, 230, 0.25)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#D5222B' }}>
                BATCH #86-0923
              </span>
              <span className="stamped-numeral" style={{ fontSize: '0.72rem', color: 'rgba(241, 237, 230, 0.6)' }}>
                INSP. #14
              </span>
            </div>
            <div className="font-script" style={{ fontSize: '1.05rem', color: '#F1EDE6', marginBottom: '0.25rem' }}>
              Order Ticket: {currentColor.name} [Size {selectedSize}]
            </div>
            <p className="font-mono" style={{ fontSize: '0.68rem', color: 'rgba(241, 237, 230, 0.45)' }}>
              Individually inspected and pre-conditioned. Ships in custom archival garment sleeve.
            </p>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleAddToCart}
            style={{
              width: '100%',
              backgroundColor: added ? '#2D8A4E' : 'var(--accent-red)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-headline)',
              fontSize: '1.45rem',
              letterSpacing: '0.06em',
              padding: '14px',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'background-color 0.25s ease, transform 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem'
            }}
          >
            {added ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                ADDED TO TAILOR QUEUE
              </>
            ) : (
              'RESERVE JACKET — ₹1,500'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
