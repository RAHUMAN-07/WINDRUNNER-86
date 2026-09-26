import React from 'react';

/**
 * Chalk-line Annotation device
 * Connects editorial notes to garment features using SVG dashed tailor's chalk strokes
 * and authentic handwriting chalk-pencil script (Kalam).
 */
export default function ChalkLeaderLines({ activeBeat = 0, scrollProgress = 0 }) {
  // Callouts mapped to each beat
  const beatAnnotations = {
    1: [ // Shell beat (12-32%)
      {
        id: 'shell-chevron',
        text: 'True 45° Chevron Bias Seam — pattern-matched at zip',
        noteNum: '01',
        from: { x: '18%', y: '36%' },
        to: { x: '42%', y: '44%' }
      },
      {
        id: 'shell-ripstop',
        text: '70D Crinkle Ripstop Nylon / Garment-Washed',
        noteNum: '02',
        from: { x: '82%', y: '28%' },
        to: { x: '64%', y: '38%' }
      },
      {
        id: 'shell-cuff',
        text: 'Double-needle hem stitch with elastic casing',
        noteNum: '03',
        from: { x: '80%', y: '72%' },
        to: { x: '68%', y: '82%' }
      }
    ],
    2: [ // Lining beat (32-52%)
      {
        id: 'lining-tape',
        text: 'Clear polyurethane heat-sealed tape (No needle holes leak)',
        noteNum: '04',
        from: { x: '15%', y: '28%' },
        to: { x: '38%', y: '32%' }
      },
      {
        id: 'lining-mesh',
        text: 'Open-pore poly knit mesh for airflow & core ventilation',
        noteNum: '05',
        from: { x: '82%', y: '34%' },
        to: { x: '58%', y: '45%' }
      },
      {
        id: 'lining-bartack',
        text: '42-stitch zig-zag bar tack at stress pocket welt',
        noteNum: '06',
        from: { x: '20%', y: '68%' },
        to: { x: '45%', y: '62%' }
      }
    ],
    3: [ // Trims beat (52-75%)
      {
        id: 'trim-zipper',
        text: 'Two-way #5 brushed nickel puller — tactile ribbed grip',
        noteNum: '07',
        from: { x: '16%', y: '38%' },
        to: { x: '48%', y: '46%' }
      },
      {
        id: 'trim-cuff',
        text: 'High-memory 1x1 knit ribbed cuffs (snaps back all season)',
        noteNum: '08',
        from: { x: '82%', y: '60%' },
        to: { x: '66%', y: '68%' }
      },
      {
        id: 'trim-aglet',
        text: 'Engraved "86" tubular brass-nickel aglets & drawcord',
        noteNum: '09',
        from: { x: '22%', y: '82%' },
        to: { x: '46%', y: '78%' }
      }
    ],
    4: [ // Label beat (75-90%)
      {
        id: 'label-woven',
        text: 'Woven damask twill neck label with overlock edges',
        noteNum: '10',
        from: { x: '18%', y: '32%' },
        to: { x: '38%', y: '38%' }
      },
      {
        id: 'label-inspector',
        text: 'Garment technologist inspection stamp: 100% true spec',
        noteNum: '11',
        from: { x: '82%', y: '44%' },
        to: { x: '62%', y: '52%' }
      }
    ]
  };

  const annotations = beatAnnotations[activeBeat] || [];

  if (annotations.length === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
        transition: 'opacity 0.4s ease'
      }}
    >
      <svg 
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="chalk-roughness">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
        </defs>

        {annotations.map((item) => (
          <g key={item.id} className="chalk-annotation-group">
            {/* Dashed chalk leader line */}
            <line
              x1={item.from.x}
              y1={item.from.y}
              x2={item.to.x}
              y2={item.to.y}
              stroke="rgba(241, 237, 230, 0.65)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              filter="url(#chalk-roughness)"
            />

            {/* Target chalk marker pin: double ring with red center dot */}
            <circle
              cx={item.to.x}
              cy={item.to.y}
              r="4.5"
              fill="none"
              stroke="rgba(241, 237, 230, 0.75)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle
              cx={item.to.x}
              cy={item.to.y}
              r="2"
              fill="#D5222B"
            />
          </g>
        ))}
      </svg>

      {/* Handwriting chalk annotation text boxes */}
      {annotations.map((item) => (
        <div
          key={`label-${item.id}`}
          style={{
            position: 'absolute',
            left: item.from.x,
            top: item.from.y,
            transform: 'translate(-10%, -50%)',
            maxWidth: '260px',
            pointerEvents: 'auto',
            background: 'rgba(20, 19, 18, 0.88)',
            border: '1px dashed rgba(241, 237, 230, 0.28)',
            padding: '6px 10px',
            borderRadius: '1px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
            <span 
              className="stamped-numeral"
              style={{ fontSize: '0.72rem', color: '#D5222B', fontWeight: 'bold' }}
            >
              REF.{item.noteNum}
            </span>
            <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(241,237,230,0.15)' }} />
          </div>
          <p
            className="font-script"
            style={{
              color: '#F1EDE6',
              fontSize: '1.02rem',
              lineHeight: 1.25,
              textShadow: '0 0 1px rgba(241, 237, 230, 0.2)'
            }}
          >
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}
