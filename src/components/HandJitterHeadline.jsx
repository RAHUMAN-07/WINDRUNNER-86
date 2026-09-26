import React, { useMemo } from 'react';

/**
 * Deterministic PRNG seeded by character and index to create consistent,
 * non-flickering "heat-pressed vinyl off-register" imperfections.
 */
function seededHash(str, index) {
  let hash = 0;
  const seedString = `${str}_${index}_tailor86`;
  for (let i = 0; i < seedString.length; i++) {
    hash = Math.trunc((hash * 31) - hash + seedString.codePointAt(i));
  }
  return Math.abs(hash);
}

export default function HandJitterHeadline({ 
  text, 
  as: Tag = 'h2', 
  className = '', 
  style = {},
  color = 'var(--text-primary)'
}) {
  const words = useMemo(() => {
    let characterIndex = 0;

    return text.split(' ').map((word, wordIndex) => {
      const characters = word.split('').map((char) => {
        const idx = characterIndex;
        characterIndex += 1;
        
      const hash = seededHash(text, idx);
      // Rotation between -1.1deg and +1.1deg (avoid 0deg)
      const sign = (hash % 2 === 0) ? 1 : -1;
      const rotMagnitude = 0.4 + ((hash % 8) / 10); // 0.4° to 1.1°
      const rot = (sign * rotMagnitude).toFixed(2);
      
      // Baseline jitter: -1.5px to +1.5px
      const jitterY = (((hash >> 3) % 5) - 2) * 0.65; // -1.3px to +1.3px
      const jitterX = (((hash >> 6) % 3) - 1) * 0.35; // subtle kerning imperfection

      return {
        id: `${wordIndex}-${idx}`,
        char,
        rot,
        jitterY: jitterY.toFixed(1),
        jitterX: jitterX.toFixed(1)
      };
      });

      characterIndex += 1;
      return characters;
    });
  }, [text]);

  return (
    <Tag 
      className={`font-headline ${className}`} 
      style={{ 
        color, 
        lineHeight: 1.08,
        letterSpacing: '0.06em',
        ...style 
      }}
      aria-label={text}
    >
      {words.map((word, wordIndex) => (
        <React.Fragment key={`${word}-${wordIndex}`}>
          <span aria-hidden="true" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {word.map((item) => (
              <span
                key={item.id}
                style={{
                  display: 'inline-block',
                  marginRight: '0.025em',
                  transform: `translate(${item.jitterX}px, ${item.jitterY}px) rotate(${item.rot}deg)`,
                  transformOrigin: '50% 85%',
                  transition: 'transform 0.15s ease'
                }}
              >
                {item.char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  );
}
