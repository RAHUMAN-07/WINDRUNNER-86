import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './OpeningAnimation.css';

export default function OpeningAnimation({ onComplete }) {
  const [visible, setVisible] = useState(true);

  const finish = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    // Auto-dismiss after 3.8s
    const t = setTimeout(finish, 3800);
    return () => clearTimeout(t);
  }, [finish]);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [visible, onComplete]);

  const stitchDots = Array.from({ length: 20 });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="oa-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onClick={finish}
          title="Click to skip"
        >
          {/* Red sweep panel */}
          <motion.div
            className="oa-sweep"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Diagonal colorblock cut */}
          <div className="oa-diag" />

          {/* Ripstop grid */}
          <motion.div
            className="oa-ripstop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />

          {/* Main content */}
          <div className="oa-content">
            <motion.div
              className="oa-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              Style No. 0286 · Thuvarankurichy, India
            </motion.div>

            <motion.h1
              className="oa-headline"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            >
              WIND<br />
              <span>RUN</span><br />
              NER
            </motion.h1>

            <motion.div
              className="oa-tagline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
            >
              '86 — Every seam has a reason.
            </motion.div>
          </div>

          {/* Progress bar */}
          <motion.div
            className="oa-bar-track"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.4 }}
          >
            <div className="oa-bar-fill" />
          </motion.div>

          {/* Stitch dots */}
          <motion.div
            className="oa-stitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.4 }}
          >
            {stitchDots.map((_, i) => (
              <div key={i} className="oa-stitch-dot" />
            ))}
          </motion.div>

          {/* Skip hint */}
          <motion.div
            style={{
              position: 'absolute', bottom: '1rem', right: '1.5rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'rgba(241,237,230,0.25)', letterSpacing: '0.08em',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            CLICK TO SKIP
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
