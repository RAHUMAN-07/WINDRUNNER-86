import React, { useState } from 'react';
import HandJitterHeadline from './HandJitterHeadline';

export default function SpecSheetModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  if (!isOpen) return null;

  const measurements = [
    { size: 'S', chestIn: 44.0, lengthIn: 26.5, sleeveIn: 34.5, hemIn: 37.0 },
    { size: 'M', chestIn: 46.5, lengthIn: 27.5, sleeveIn: 35.5, hemIn: 39.5 },
    { size: 'L', chestIn: 49.0, lengthIn: 28.5, sleeveIn: 36.5, hemIn: 42.0 },
    { size: 'XL', chestIn: 52.0, lengthIn: 29.5, sleeveIn: 37.5, hemIn: 45.0 },
    { size: 'XXL', chestIn: 55.0, lengthIn: 30.0, sleeveIn: 38.5, hemIn: 48.0 }
  ];

  const toCm = (val) => (val * 2.54).toFixed(1);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(10, 9, 8, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '88vh',
          backgroundColor: '#181715',
          border: '1px solid rgba(241, 237, 230, 0.22)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          borderRadius: '2px',
          overflowY: 'auto',
          padding: '2.5rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: '1px dashed rgba(241, 237, 230, 0.3)',
            color: 'rgba(241, 237, 230, 0.7)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            padding: '4px 10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D5222B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(241, 237, 230, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(241, 237, 230, 0.3)';
          }}
        >
          [ESC] CLOSE SPEC
        </button>

        {/* Blueprint Header */}
        <div style={{ borderBottom: '1px dashed rgba(241, 237, 230, 0.2)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <span className="spec-tag" style={{ border: '1px solid #D5222B', color: '#D5222B', fontWeight: 'bold' }}>
                  TECH PACK #0286
                </span>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'rgba(241, 237, 230, 0.5)' }}>
                  ISO 4915 / GARMENT CONSTRUCTION STANDARD
                </span>
              </div>
              <HandJitterHeadline 
                text="WINDRUNNER '86 SPECIFICATION SHEET" 
                as="h3" 
                style={{ fontSize: '2.2rem', color: '#F1EDE6' }} 
              />
            </div>

            {/* Rubber-stamped inspection mark */}
            <div
              style={{
                border: '2px solid rgba(213, 34, 43, 0.75)',
                borderRadius: '4px',
                padding: '6px 14px',
                textAlign: 'center',
                transform: 'rotate(-2.5deg)',
                boxShadow: '0 0 8px rgba(213, 34, 43, 0.15)'
              }}
            >
              <div className="font-mono" style={{ fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.12em' }}>
                SAMPLE ROOM APPROVED
              </div>
              <div className="stamped-numeral" style={{ fontSize: '1.1rem', color: '#D5222B', fontWeight: 'bold' }}>
                INSP. #14
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Technical Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Shell & Fabric */}
          <div style={{ backgroundColor: 'rgba(20, 19, 18, 0.65)', border: '1px solid rgba(241, 237, 230, 0.1)', padding: '1.25rem' }}>
            <h4 className="font-mono" style={{ fontSize: '0.78rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              01 // SHELL & WEAVE
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'rgba(241, 237, 230, 0.75)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li><strong>Weight:</strong> 70D Crinkle Ripstop (115 GSM)</li>
              <li><strong>Finish:</strong> DWR Water-Repellent, Fluorocarbon-Free</li>
              <li><strong>Colorway:</strong> Scarlet Red (#D5222B) / Black / Off-White</li>
              <li><strong>Wash:</strong> Enzyme garment-washed for broken-in drape</li>
            </ul>
          </div>

          {/* Stitch & Thread Specs */}
          <div style={{ backgroundColor: 'rgba(20, 19, 18, 0.65)', border: '1px solid rgba(241, 237, 230, 0.1)', padding: '1.25rem' }}>
            <h4 className="font-mono" style={{ fontSize: '0.78rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              02 // SEAM INTEGRITY
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'rgba(241, 237, 230, 0.75)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li><strong>Stitch Density:</strong> 11.5 SPI (Stitches Per Inch)</li>
              <li><strong>Thread:</strong> Bonded Continuous Filament Nylon 40</li>
              <li><strong>Tape:</strong> 22mm Hot-melt Polyurethane along shoulders</li>
              <li><strong>Bar-Tacks:</strong> 42-stitch zig-zag reinforcement on welts</li>
            </ul>
          </div>

          {/* Hardware & Trims */}
          <div style={{ backgroundColor: 'rgba(20, 19, 18, 0.65)', border: '1px solid rgba(241, 237, 230, 0.1)', padding: '1.25rem' }}>
            <h4 className="font-mono" style={{ fontSize: '0.78rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              03 // HARDWARE & TRIMS
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'rgba(241, 237, 230, 0.75)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li><strong>Zipper:</strong> #5 Two-way brushed nickel with molded track</li>
              <li><strong>Puller:</strong> Ergonomic knurled grip, snag-free slider</li>
              <li><strong>Cuffs:</strong> 1x1 heavy resilient knit elastic band</li>
              <li><strong>Aglets:</strong> Turned brass-nickel tube with stamped '86</li>
            </ul>
          </div>
        </div>

        {/* Pattern Pieces Cut List */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 className="font-mono" style={{ fontSize: '0.82rem', color: '#F1EDE6', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#D5222B' }}>■</span> PATTERN PIECES INVENTORY (CUT MASTER)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.65rem' }}>
            {[
              'P-01 Upper Left Shell (Red)',
              'P-02 Upper Right Shell (Red)',
              'P-03 Chevron Stripe Left (Off-White)',
              'P-04 Chevron Stripe Right (Off-White)',
              'P-05 Lower Torso Shell (Pitch Black)',
              'P-06 Raglan Sleeve Left (Split Color)',
              'P-07 Raglan Sleeve Right (Split Color)',
              'P-08 Stand-up Collar Band',
              'P-09 Back Vent Panel & Yoke',
              'P-10 Micro-Mesh Poly Interior Lining',
              'P-11 Welt Pocket Enclosures (x2)',
              'P-12 Woven Neck Label & Loop'
            ].map((p, idx) => (
              <div 
                key={idx} 
                className="font-mono"
                style={{
                  fontSize: '0.74rem',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed rgba(241, 237, 230, 0.18)',
                  color: 'rgba(241, 237, 230, 0.8)'
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Dimensional Grading Chart with Unit Toggle */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 className="font-mono" style={{ fontSize: '0.82rem', color: '#F1EDE6', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#D5222B' }}>■</span> FINISHED GARMENT MEASUREMENT CHART
            </h4>

            {/* Toggle unit */}
            <div style={{ display: 'flex', border: '1px solid rgba(241, 237, 230, 0.25)', borderRadius: '2px', overflow: 'hidden' }}>
              <button
                onClick={() => setUnit('in')}
                style={{
                  background: unit === 'in' ? '#D5222B' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                INCHES
              </button>
              <button
                onClick={() => setUnit('cm')}
                style={{
                  background: unit === 'cm' ? '#D5222B' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                CENTIMETERS
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(241, 237, 230, 0.25)', color: 'rgba(241, 237, 230, 0.6)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>SIZE</th>
                <th style={{ padding: '8px 12px' }}>CHEST CIRCUMFERENCE</th>
                <th style={{ padding: '8px 12px' }}>BODY LENGTH</th>
                <th style={{ padding: '8px 12px' }}>RAGLAN SLEEVE</th>
                <th style={{ padding: '8px 12px' }}>HEM SWEEP</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(241, 237, 230, 0.08)', color: 'rgba(241, 237, 230, 0.85)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#D5222B' }}>{row.size}</td>
                  <td style={{ padding: '8px 12px' }}>{unit === 'in' ? `${row.chestIn}"` : `${toCm(row.chestIn)} cm`}</td>
                  <td style={{ padding: '8px 12px' }}>{unit === 'in' ? `${row.lengthIn}"` : `${toCm(row.lengthIn)} cm`}</td>
                  <td style={{ padding: '8px 12px' }}>{unit === 'in' ? `${row.sleeveIn}"` : `${toCm(row.sleeveIn)} cm`}</td>
                  <td style={{ padding: '8px 12px' }}>{unit === 'in' ? `${row.hemIn}"` : `${toCm(row.hemIn)} cm`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed rgba(241, 237, 230, 0.15)', paddingTop: '1.25rem' }}>
          <p className="font-mono" style={{ fontSize: '0.72rem', color: 'rgba(241, 237, 230, 0.45)' }}>
            CARE: MACHINE WASH COLD (30°C) · LINE DRY IN SHADE · DO NOT IRON SHELL · NON-CHLORINE BLEACH ONLY
          </p>
          <button
            onClick={() => window.print()}
            style={{
              background: 'none',
              border: '1px solid rgba(241, 237, 230, 0.3)',
              color: '#F1EDE6',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            PRINT SPEC
          </button>
        </div>
      </div>
    </div>
  );
}
