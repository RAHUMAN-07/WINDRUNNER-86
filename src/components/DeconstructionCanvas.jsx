import React, { useEffect, useState, useRef } from 'react';

const STAGES = [
  { id: 'hero',      src: '/renders/hero_assembled.jpg',       name: 'Hero Assembled' },
  { id: 'shell',     src: '/renders/shell_separating.jpg',     name: 'Shell Separating' },
  { id: 'lining',    src: '/renders/lining_taped_seams.jpg',   name: 'Lining & Seam Tape' },
  { id: 'trims',     src: '/renders/trims_hardware.jpg',       name: 'Trims & Hardware' },
  { id: 'flatlay',   src: '/renders/flatlay_deconstructed.jpg','name': 'Technical Flat-Lay' },
  { id: 'reassembly',src: '/renders/reassembly_stitch.jpg',    name: 'Reassembly & Stitch' },
];

// Maps scroll progress 0→1 to which stage (0–5) is active
function getStageIndex(progress) {
  // Beat boundaries: 0-12%, 12-32%, 32-52%, 52-75%, 75-90%, 90-100%
  if (progress < 0.12) return 0;
  if (progress < 0.32) return 1;
  if (progress < 0.52) return 2;
  if (progress < 0.75) return 3;
  if (progress < 0.90) return 4;
  return 5;
}

// Smooth 0→1 opacity for each stage based on scroll progress
function getStageOpacity(stageIdx, progress) {
  const boundaries = [0, 0.12, 0.32, 0.52, 0.75, 0.90, 1.0];
  const stageStart = boundaries[stageIdx];
  const stageEnd   = boundaries[stageIdx + 1] || 1.0;
  const fadeDuration = 0.06; // crossfade over 6% scroll

  if (progress < stageStart - fadeDuration) return 0;
  if (progress >= stageEnd) {
    // fade out during next stage's fade-in
    const nextEnd = boundaries[stageIdx + 2] || 1.0;
    if (progress < stageEnd + fadeDuration) {
      return 1 - (progress - stageEnd) / fadeDuration;
    }
    return 0;
  }
  // fade in
  if (progress < stageStart + fadeDuration) {
    return (progress - stageStart + fadeDuration) / fadeDuration;
  }
  return 1;
}

export default function DeconstructionCanvas({ scrollProgress = 0, activeBeat = 0, onFrameUpdate, children }) {
  const [imagesLoaded, setImagesLoaded] = useState({});
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const stitchRef = useRef(0);

  // Preload all images eagerly
  useEffect(() => {
    STAGES.forEach((stage) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [stage.id]: true }));
      };
      img.onerror = () => {
        console.warn('Failed to load:', stage.src);
        setImagesLoaded(prev => ({ ...prev, [stage.id]: true }));
      };
      img.src = stage.src;
    });
  }, []);

  // Update frame telemetry
  useEffect(() => {
    if (onFrameUpdate) {
      onFrameUpdate(Math.round(scrollProgress * 119), scrollProgress);
    }
  }, [scrollProgress, onFrameUpdate]);

  // Animated stitch canvas overlay for reassembly beat
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let stopped = false;

    const draw = (time) => {
      if (stopped) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Animated stitch lines only during reassembly beat (activeBeat 5)
      if (activeBeat === 5 && scrollProgress >= 0.88) {
        const ratio = Math.min((scrollProgress - 0.88) / 0.12, 1.0);
        const cx = w / 2;
        const cy = h * 0.47;
        const sx = Math.min(w * 0.30, 260);
        const sy = sx * 0.40;

        // Animated dash offset — "thread being pulled through"
        const dashOffset = -(time * 0.06);

        // Left chevron seam
        ctx.strokeStyle = '#D9A84E';
        ctx.lineWidth   = 2;
        ctx.setLineDash([6, 5]);
        ctx.lineDashOffset = dashOffset;
        ctx.beginPath();
        ctx.moveTo(cx - sx, cy - sy);
        ctx.lineTo(cx - sx + (sx) * ratio, cy - sy + (sy + sy * 0.6) * ratio);
        ctx.stroke();

        // Right chevron seam
        ctx.beginPath();
        ctx.moveTo(cx + sx, cy - sy);
        ctx.lineTo(cx + sx - (sx) * ratio, cy - sy + (sy + sy * 0.6) * ratio);
        ctx.stroke();

        // Center zipper stitch
        ctx.strokeStyle   = 'rgba(241, 237, 230, 0.85)';
        ctx.lineWidth     = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = dashOffset;
        ctx.beginPath();
        ctx.moveTo(cx, cy - sy * 1.2);
        ctx.lineTo(cx, cy - sy * 1.2 + (sy * 2.8) * ratio);
        ctx.stroke();

        // Needle glint
        if (ratio < 0.96) {
          ctx.setLineDash([]);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#F5CD9B';
          ctx.shadowBlur  = 10;
          ctx.beginPath();
          ctx.arc(cx - sx + sx * ratio, cy - sy + (sy * 1.6) * ratio, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      stopped = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeBeat, scrollProgress]);

  return (
    <div style={{
      position:  'sticky',
      top:       0,
      left:      0,
      width:     '100%',
      height:    '100vh',
      overflow:  'hidden',
      backgroundColor: '#141312',
      zIndex:    1,
    }}>
      {/* Subtle cutting-table grid */}
      <div style={{
        position: 'absolute',
        inset:    0,
        backgroundImage: `
          linear-gradient(rgba(241,237,230,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(241,237,230,0.022) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents:  'none',
        zIndex: 0,
      }} />

      {/* ── Crossfading Stage Images ── */}
      {STAGES.map((stage, idx) => {
        // Simple opacity: 1 when active, 0 otherwise — CSS transition does the crossfade
        const isActive = activeBeat === idx;
        return (
          <img
            key={stage.id}
            src={stage.src}
            alt={stage.name}
            style={{
              position:   'absolute',
              inset:      0,
              width:      '100%',
              height:     '100%',
              objectFit:  'contain',
              objectPosition: 'center center',
              opacity:    isActive ? 1 : 0,
              transition: 'opacity 0.75s cubic-bezier(0.25, 1, 0.5, 1)',
              zIndex:     1,
              // Edge-fade mask so image bleeds into #141312 void
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 55%, transparent 100%)',
              maskImage:       'radial-gradient(ellipse 80% 80% at 50% 50%, black 55%, transparent 100%)',
            }}
          />
        );
      })}

      {/* Tungsten lamp overhead glow */}
      <div style={{
        position: 'absolute',
        inset:    0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 35%, rgba(245,205,155,0.06) 0%, rgba(20,19,18,0.0) 60%, rgba(20,19,18,0.65) 100%)',
        pointerEvents: 'none',
        zIndex:   3,
      }} />

      {/* Stitch animation canvas overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'absolute',
          inset:         0,
          width:         '100%',
          height:        '100%',
          pointerEvents: 'none',
          zIndex:        4,
        }}
      />

      {/* Render overlay children (ChalkLeaderLines, BeatCopy) inside the sticky canvas container */}
      {children}
    </div>
  );
}
