import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HandJitterHeadline from '../components/HandJitterHeadline';
import DeconstructionCanvas from '../components/DeconstructionCanvas';
import ScrubberBar from '../components/ScrubberBar';
import SpecSheetModal from '../components/SpecSheetModal';
import FabricLoupe from '../components/FabricLoupe';
import ShopDrawer from '../components/ShopDrawer';
import Footer from '../components/Footer';
import SiteNav from '../components/SiteNav';

// Beat configuration — scroll progress ranges
const BEATS = [
  { id: 0, rangeStart: 0,    rangeEnd: 0.12, label: 'HERO' },
  { id: 1, rangeStart: 0.12, rangeEnd: 0.32, label: 'THE SHELL' },
  { id: 2, rangeStart: 0.32, rangeEnd: 0.52, label: 'THE LINING' },
  { id: 3, rangeStart: 0.52, rangeEnd: 0.75, label: 'THE TRIMS' },
  { id: 4, rangeStart: 0.75, rangeEnd: 0.90, label: 'THE LABEL' },
  { id: 5, rangeStart: 0.90, rangeEnd: 1.00, label: 'REASSEMBLY' },
];

function getActiveBeat(progress) {
  for (let i = BEATS.length - 1; i >= 0; i--) {
    if (progress >= BEATS[i].rangeStart) return BEATS[i].id;
  }
  return 0;
}

const ANNOTATIONS = {
  1: [
    { id: 'shell-1', text: 'True 45° chevron bias seam — matched at zipper', ref: 'REF.01', cx: '22%', cy: '38%', tx: '25%', ty: '20%' },
    { id: 'shell-2', text: '70D crinkle ripstop · garment-washed · DWR finish', ref: 'REF.02', cx: '72%', cy: '34%', tx: '65%', ty: '18%' },
  ],
  2: [
    { id: 'lining-1', text: 'Clear polyurethane heat-sealed tape — no needle holes leak', ref: 'REF.03', cx: '34%', cy: '30%', tx: '12%', ty: '22%' },
    { id: 'lining-2', text: '42-stitch zig-zag bar tack at pocket welt stress point', ref: 'REF.04', cx: '38%', cy: '65%', tx: '12%', ty: '72%' },
  ],
  3: [
    { id: 'trim-1', text: '#5 two-way brushed nickel puller — tactile ribbed grip', ref: 'REF.05', cx: '48%', cy: '42%', tx: '14%', ty: '12%' },
    { id: 'trim-2', text: '1×1 high-memory knit cuffs — snaps back all season', ref: 'REF.06', cx: '68%', cy: '70%', tx: '72%', ty: '80%' },
  ],
  4: [
    { id: 'label-1', text: 'Woven damask twill neck label with overlock edges', ref: 'REF.07', cx: '40%', cy: '35%', tx: '12%', ty: '25%' },
    { id: 'label-2', text: 'Inspector stamp · 100% spec-true garment', ref: 'REF.08', cx: '58%', cy: '55%', tx: '65%', ty: '20%' },
  ],
};

function ChalkLeaderLines({ activeBeat }) {
  const items = ANNOTATIONS[activeBeat] || [];
  if (!items.length) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <filter id="chalk">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="0.4" />
          </filter>
        </defs>
        {items.map(item => (
          <g key={item.id} style={{ opacity: 0.9 }}>
            <line x1={item.tx} y1={item.ty} x2={item.cx} y2={item.cy}
              stroke="rgba(241,237,230,0.7)" strokeWidth="0.35" strokeDasharray="1.2 1.0" filter="url(#chalk)" />
            <circle cx={item.cx} cy={item.cy} r="0.8" fill="none" stroke="rgba(241,237,230,0.6)" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
            <circle cx={item.cx} cy={item.cy} r="0.35" fill="#D5222B" />
          </g>
        ))}
      </svg>
      {items.map(item => (
        <div key={`t-${item.id}`} style={{
          position: 'absolute', left: item.tx, top: item.ty,
          transform: 'translate(-5%, -50%)', maxWidth: '240px',
          backgroundColor: 'rgba(20,19,18,0.9)', border: '1px dashed rgba(241,237,230,0.3)',
          padding: '6px 10px 8px', backdropFilter: 'blur(6px)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#D5222B', marginBottom: '3px', letterSpacing: '0.08em' }}>{item.ref}</div>
          <p style={{ fontFamily: 'var(--font-script)', fontSize: '0.96rem', color: '#F1EDE6', lineHeight: 1.3, margin: 0 }}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function BeatCopy({ beat, onOpenShop, onOpenSpec, onScrollNext }) {
  const shared = {
    position: 'absolute',
    zIndex: 25,
    transition: 'opacity 0.4s ease, transform 0.4s ease',
    pointerEvents: 'auto'
  };
  const visible = { opacity: 1, pointerEvents: 'auto', transform: 'translateY(0)' };
  const hidden  = { opacity: 0, pointerEvents: 'none', transform: 'translateY(16px)' };
  const show = (b) => beat === b ? visible : hidden;

  return (
    <>
      <div style={{ ...shared, left: '5vw', bottom: '14vh', maxWidth: '520px', ...show(0) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#D5222B', letterSpacing: '0.08em' }}>01 // ASSEMBLED HERO</span>
        </div>
        <HandJitterHeadline text="EVERY SEAM HAS A REASON." as="h1"
          style={{ fontSize: 'clamp(2.4rem,5vw,4rem)', color: '#FFFFFF', marginBottom: '1rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.55, marginBottom: '1.5rem', maxWidth: '420px' }}>
          A jacket built the way it looks — nothing hidden, nothing faked.
        </p>
        <button onClick={onScrollNext} style={{
          background: 'none', border: '1px dashed rgba(241,237,230,0.4)', color: '#F1EDE6',
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '8px 16px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.06em'
        }}>
          ↓ UNPICK SEAMS TO FLAT-LAY
        </button>
      </div>

      <div style={{ ...shared, left: '5vw', top: '20vh', maxWidth: '460px', ...show(1) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#D5222B' }}>02 // THE SHELL PANELS</span>
        </div>
        <HandJitterHeadline text="THE COLORWAY ISN'T PRINTED ON. IT'S CUT AND SEWN." as="h2"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,3.1rem)', color: '#FFFFFF', marginBottom: '1.1rem' }} />
        <div style={{ borderLeft: '2px solid #D5222B', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.55 }}>
            Three panel colors, one continuous diagonal line — matched at every seam, not faked with a print.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Ripstop shell, garment-washed for a break-in look on day one.
          </p>
        </div>
      </div>

      <div style={{ ...shared, right: '5vw', top: '20vh', maxWidth: '460px', textAlign: 'right', ...show(2) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#D5222B' }}>03 // THE INTERIOR ARCHITECTURE</span>
        </div>
        <HandJitterHeadline text="WHAT YOU DON'T SEE IS DOING HALF THE WORK." as="h2"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,3.1rem)', color: '#FFFFFF', marginBottom: '1.1rem' }} />
        <div style={{ borderRight: '2px solid rgba(241,237,230,0.35)', paddingRight: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.55 }}>
            A mesh lining that breathes, taped seams that don't leak at the shoulders.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Bar-tacked stress points — the parts of a jacket that fail first, reinforced first.
          </p>
        </div>
      </div>

      <div style={{ ...shared, left: '5vw', top: '20vh', maxWidth: '460px', ...show(3) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9A9C9E' }}>04 // HARDWARE & TRIMS</span>
        </div>
        <HandJitterHeadline text="THE HARDWARE YOU TOUCH A HUNDRED TIMES A DAY." as="h2"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,3.1rem)', color: '#FFFFFF', marginBottom: '1.1rem' }} />
        <div style={{ borderLeft: '2px solid #9A9C9E', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.55 }}>
            A two-way zipper that doesn't catch fabric, on a puller you can find by feel.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Elastic with memory — cuffs that snap back after a season, not a week.
          </p>
        </div>
      </div>

      <div style={{ ...shared, left: '5vw', bottom: '16vh', maxWidth: '460px', ...show(4) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#D5222B' }}>05 // THE FLAT-LAY LABELS</span>
        </div>
        <HandJitterHeadline text="EVERYTHING ON THIS LABEL IS TRUE." as="h2"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,3.1rem)', color: '#FFFFFF', marginBottom: '1rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.55, marginBottom: '1.25rem', maxWidth: '380px' }}>
          Style number, fabric content, care instructions — read it before you read the marketing.
        </p>
        <button onClick={onOpenSpec} style={{
          background: 'none', border: '1px dashed rgba(241,237,230,0.35)', color: '#F1EDE6',
          fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '8px 14px',
          cursor: 'pointer', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          ⚙ READ COMPLETE GARMENT TECH PACK
        </button>
      </div>

      <div style={{
        ...shared, left: '50%', top: '50%', width: '90%', maxWidth: '600px', textAlign: 'center',
        ...show(5), transform: beat === 5 ? 'translate(-50%, -50%)' : 'translate(-50%, -44%)',
      }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#D5222B', letterSpacing: '0.08em' }}>06 // REASSEMBLED SEAM LOCK</span>
        </div>
        <HandJitterHeadline text="STITCHED BACK TOGETHER. WORN FROM HERE." as="h2"
          style={{ fontSize: 'clamp(2.2rem,4.5vw,4rem)', color: '#FFFFFF', marginBottom: '0.85rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.15rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          The colorway that started it — back in rotation.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onOpenShop} style={{
            backgroundColor: '#D5222B', color: '#FFFFFF',
            fontFamily: 'var(--font-headline)', fontSize: '1.4rem',
            letterSpacing: '0.06em', padding: '15px 36px',
            border: 'none', borderRadius: '2px', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(213,34,43,0.45)',
            transition: 'background-color 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b81c24'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#D5222B'}
          >
            Shop the Colorway
          </button>
          <button onClick={onOpenSpec} className="chalk-link" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: '0.84rem',
            color: 'rgba(241,237,230,0.6)', letterSpacing: '0.06em',
          }}>
            Download the Spec Sheet →
          </button>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentFrame,   setCurrentFrame]   = useState(0);
  const [activeBeat,     setActiveBeat]      = useState(0);
  const [isSpecOpen,     setIsSpecOpen]      = useState(false);
  const [isShopOpen,     setIsShopOpen]      = useState(false);
  const [isLoupeOn,      setIsLoupeOn]       = useState(false);
  const [isScrubberVisible, setIsScrubberVisible] = useState(true);
  const scrollTrackRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const el = scrollTrackRef.current;
      if (!el) return;
      const totalScrollable = el.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - el.offsetTop;
      const progress = Math.max(0, Math.min(1, scrolled / Math.max(1, totalScrollable)));
      setScrollProgress(progress);
      setActiveBeat(getActiveBeat(progress));

      // Scrubber smoothly hides when scrolling past the jacket story into Cutting Log / Footer
      setIsScrubberVisible(scrolled >= 0 && scrolled <= totalScrollable + 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateToBeat = useCallback((beatId) => {
    const el = scrollTrackRef.current;
    if (!el) return;
    const totalScrollable = el.scrollHeight - window.innerHeight;
    const targets = [0.05, 0.22, 0.42, 0.63, 0.82, 0.96];
    const targetY = el.offsetTop + totalScrollable * (targets[beatId] || 0);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ backgroundColor: '#141312', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <SiteNav />

      {/* Scroll Track — sticky canvas keeps all jacket elements and text inside, scrolling off smoothly before subsequent sections */}
      <div
        ref={scrollTrackRef}
        style={{ position: 'relative', height: '380vh', backgroundColor: '#141312' }}
      >
        <DeconstructionCanvas scrollProgress={scrollProgress} activeBeat={activeBeat} onFrameUpdate={setCurrentFrame}>
          <ChalkLeaderLines activeBeat={activeBeat} />
          <BeatCopy
            beat={activeBeat}
            onOpenShop={() => navigate('/store')}
            onOpenSpec={() => setIsSpecOpen(true)}
            onScrollNext={() => navigateToBeat(1)}
          />
        </DeconstructionCanvas>
      </div>

      {/* Cutting Log Section */}
      <section style={{ backgroundColor: '#181715', borderTop: '1px solid rgba(241,237,230,0.12)', padding: '6rem 2rem 8rem', position: 'relative', zIndex: 30 }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem', borderBottom: '1px dashed rgba(241,237,230,0.18)', paddingBottom: '1.5rem' }}>
            <div>
              <span style={{ display: 'inline-block', marginBottom: '0.6rem', border: '1px solid #D5222B', color: '#D5222B', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', padding: '3px 8px' }}>
                SAMPLE ROOM ARCHIVE
              </span>
              <HandJitterHeadline text="THE TAILOR'S CUTTING LOG" as="h3" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)', color: '#F1EDE6' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(241,237,230,0.5)', maxWidth: '380px', lineHeight: 1.6 }}>
              Notes from the sewing bench. Every unpicked seam, tension test, and pattern alteration recorded during construction.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
            {[
              { num: 'NOTE #01 // CHEVRON BIAS', title: 'THE 45° CHEVRON INTERSECTION', body: 'A printed chevron shifts when you twist your torso. Cut on a true 45° bias, the scarlet and off-white panels pull against each other with equal tension.', note: '"If the chevron misses by 1mm at the teeth, scrap the cut."' },
              { num: 'NOTE #02 // THREAD TENSION', title: 'BONDED NYLON 40 & LOCKSTITCH', body: 'Standard spun polyester thread shears when ripstop nylon flexes in high winds. We sew with bonded continuous filament nylon 40 at 11.5 SPI.', note: '"11.5 stitches per inch gives resilience without perforating the film."' },
              { num: 'NOTE #03 // HARDWARE SELECTION', title: 'TWO-WAY BRUSHED NICKEL', body: "A runner doesn't want to stop to adjust ventilation. The two-way #5 zipper allows the jacket to vent from the bottom hem upwards during hill repeats.", note: '"Tactile knurled puller — operable with cold or gloved hands."' }
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(20,19,18,0.8)', border: '1px solid rgba(241,237,230,0.12)', padding: '1.75rem' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#D5222B', fontWeight: 'bold' }}>{item.num}</span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.45rem', color: '#FFFFFF', marginBottom: '0.65rem', letterSpacing: '0.04em' }}>{item.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1rem' }}>{item.body}</p>
                <div style={{ fontFamily: 'var(--font-script)', color: '#F1EDE6', fontSize: '1.05rem', borderTop: '1px dashed rgba(241,237,230,0.15)', paddingTop: '0.75rem' }}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Scrubber only shows while exploring the jacket story, hides cleanly for Cutting Log & Footer */}
      <div style={{
        opacity: isScrubberVisible ? 1 : 0,
        pointerEvents: isScrubberVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: isScrubberVisible ? 'translateY(0)' : 'translateY(24px)',
      }}>
        <ScrubberBar
          scrollProgress={scrollProgress} currentFrame={currentFrame} activeBeat={activeBeat}
          onNavigateBeat={navigateToBeat}
          onToggleLoupe={() => setIsLoupeOn(v => !v)} isLoupeActive={isLoupeOn}
          onOpenSpecSheet={() => setIsSpecOpen(true)}
        />
      </div>
      <FabricLoupe isActive={isLoupeOn} activeBeat={activeBeat} onClose={() => setIsLoupeOn(false)} />
      <SpecSheetModal isOpen={isSpecOpen} onClose={() => setIsSpecOpen(false)} />
      <ShopDrawer isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
    </div>
  );
}
