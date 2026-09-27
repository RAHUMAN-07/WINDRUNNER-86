import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(err => console.error('Failed to load products', err));
  }, []);

  if (!products.length) return <p style={{ color: '#f1ede6', textAlign: 'center' }}>Loading products…</p>;

  return (
    <section style={{ padding: '4rem 2rem', backgroundColor: '#141312' }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(2rem,5vw,3rem)', color: '#f1ede6', textAlign: 'center', marginBottom: '2rem' }}>
        SHOP THE COLLECTION
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {products.map(p => (
          <div key={p.id} style={{
            background: 'rgba(20,19,18,0.85)',
            border: '1px solid rgba(241,237,230,0.12)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <img src={p.image} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', color: '#f1ede6', margin: '0 0 0.5rem' }}>{p.name}</h3>
              <p style={{ fontFamily: 'var(--font-mono)', color: '#d5222b', margin: '0 0 1rem', fontWeight: 'bold' }}>₹{Math.round(p.price).toLocaleString('en-IN')}</p>
              <button
                onClick={() => navigate(`/product/${p.id}`)}
                style={{
                  marginTop: 'auto',
                  backgroundColor: '#d5222b',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  borderRadius: '2px',
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
