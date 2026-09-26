import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, csrfToken } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/products/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Jacket not found');
        return response.json();
      })
      .then(data => {
        setProduct(data);
        setSelectedSize(data.sizes?.includes('M') ? 'M' : data.sizes?.[0] || 'S');
      })
      .catch(() => setError('This jacket could not be found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const toggleWishlist = async () => {
    const response = await fetch(`/api/wishlist/${product.id}`, { method: saved ? 'DELETE' : 'POST', credentials: 'include', headers: { 'x-csrf-token': csrfToken } });
    if (response.ok) setSaved(!saved);
  };

  const submitReview = async event => {
    event.preventDefault();
    const response = await fetch(`/api/products/${product.id}/reviews`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ name: user.name, ...review }) });
    const data = await response.json();
    if (!response.ok) return setReviewMessage(data.error || 'Unable to submit review');
    setProduct(current => ({ ...current, reviews: [data, ...(current.reviews || [])] }));
    setReview({ rating: 5, comment: '' });
    setReviewMessage('Review submitted.');
  };

  if (loading) {
    return <PageShell><div style={messageStyle}>Loading jacket details...</div></PageShell>;
  }

  if (error || !product) {
    return (
      <PageShell>
        <div style={messageStyle}>
          <p style={{ color: '#D5222B', marginBottom: '1rem' }}>{error || 'Jacket not found.'}</p>
          <Link to="/store" style={backLinkStyle}>Back to shop</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '112px 2rem 5rem' }}>
        <Link to="/store" style={backLinkStyle}>← Back to collection</Link>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)', gap: '3rem', marginTop: '1.5rem', alignItems: 'start' }}>
          <div style={{ backgroundColor: '#100f0e', border: '1px solid rgba(241,237,230,0.12)' }}>
            <img
              src={product.image || '/renders/hero_assembled.jpg'}
              alt={product.name}
              style={{ display: 'block', width: '100%', aspectRatio: '1 / 0.9', objectFit: 'cover' }}
            />
          </div>

          <div>
            <div style={eyebrowStyle}>{product.category} · {product.style_no}</div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(2.5rem, 5vw, 4.8rem)', lineHeight: 0.98, letterSpacing: '0.04em', color: '#F1EDE6', margin: '0.7rem 0 1rem' }}>
              {product.name}
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: '#D5222B', marginBottom: '1.5rem' }}>
              ₹{Math.round(product.price).toLocaleString('en-IN')}
            </div>
            <p style={{ color: 'rgba(241,237,230,0.72)', lineHeight: 1.75, marginBottom: '1.25rem' }}>{product.description}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'rgba(241,237,230,0.58)', borderLeft: '2px solid #D5222B', paddingLeft: '1rem', marginBottom: '2rem' }}>
              Colorway: {product.colorway}
            </p>

            <div style={{ borderTop: '1px dashed rgba(241,237,230,0.18)', borderBottom: '1px dashed rgba(241,237,230,0.18)', padding: '1.25rem 0', marginBottom: '1.25rem' }}>
              <div style={labelStyle}>Select size</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(product.sizes || []).map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} style={{ ...sizeButtonStyle, ...(selectedSize === size ? selectedSizeStyle : {}) }}>
                    {size}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: product.stock > 5 ? 'rgba(241,237,230,0.5)' : '#D5222B', marginTop: '0.9rem' }}>
                {product.stock > 0 ? `${product.stock} in stock · Ships in 2 days` : 'Out of stock'}
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ width: '100%', backgroundColor: added ? '#2D8A4E' : '#D5222B', color: '#fff', border: 'none', padding: '1rem', fontFamily: 'var(--font-headline)', fontSize: '1.35rem', letterSpacing: '0.05em', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', opacity: product.stock === 0 ? 0.5 : 1 }}>
              {added ? '✓ ADDED TO CART' : 'ADD TO CART'}
            </button>
            <button onClick={toggleWishlist} style={wishlistButtonStyle}>{saved ? '♥ SAVED TO WISHLIST' : '♡ SAVE TO WISHLIST'}</button>
          </div>
        </section>

        <section style={{ marginTop: '5rem', borderTop: '1px solid rgba(241,237,230,0.12)', paddingTop: '2rem' }}>
          <div style={eyebrowStyle}>Construction notes</div>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.2rem', letterSpacing: '0.04em', color: '#F1EDE6', margin: '0.5rem 0 1.5rem' }}>FIELD NOTES FROM THE BENCH</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              ['HAND INSPECTED', 'Every jacket is checked at the bench before it leaves Thuvarankurichy.'],
              ['BUILT FOR ROTATION', 'Hardwearing materials and reinforced stress points for repeated wear.'],
              ['PAYMENT OPTIONS', 'Choose COD, UPI, cards, net banking, or digital wallets at checkout.'],
            ].map(([title, copy]) => (
              <div key={title} style={{ backgroundColor: '#1b1917', border: '1px solid rgba(241,237,230,0.1)', padding: '1.25rem' }}>
                <div style={labelStyle}>{title}</div>
                <p style={{ color: 'rgba(241,237,230,0.58)', fontSize: '0.9rem', lineHeight: 1.55, marginTop: '0.5rem' }}>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: '5rem', maxWidth: '760px' }}>
          <div style={eyebrowStyle}>Customer notes · {product.reviews?.length || 0}</div>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.2rem', letterSpacing: '0.04em', color: '#F1EDE6', margin: '0.5rem 0 1.5rem' }}>REVIEWS</h2>
          {product.reviews?.length ? product.reviews.map(review => (
            <article key={review.id} style={{ borderTop: '1px dashed rgba(241,237,230,0.16)', padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#D9A84E' }}>
                <span>{review.name}</span><span>{'★'.repeat(review.rating)}</span>
              </div>
              <p style={{ color: 'rgba(241,237,230,0.65)', lineHeight: 1.6, marginTop: '0.45rem' }}>{review.comment}</p>
            </article>
          )) : <p style={{ color: 'rgba(241,237,230,0.5)' }}>No reviews yet for this jacket.</p>}
          <form onSubmit={submitReview} style={{ display: 'grid', gap: '0.7rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(241,237,230,0.16)' }}>
            <div style={labelStyle}>Leave a review</div>
            <select value={review.rating} onChange={event => setReview({ ...review, rating: Number(event.target.value) })} style={reviewInputStyle}><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select>
            <textarea value={review.comment} onChange={event => setReview({ ...review, comment: event.target.value })} required maxLength={2000} placeholder="What did you think?" style={{ ...reviewInputStyle, minHeight: '100px' }} />
            <button type="submit" style={reviewButtonStyle}>SUBMIT REVIEW</button>
            {reviewMessage && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#D9A84E' }}>{reviewMessage}</div>}
          </form>
        </section>
      </main>
      <Footer />
    </PageShell>
  );
}

function PageShell({ children }) {
  return <div style={{ backgroundColor: '#141312', minHeight: '100vh', color: '#F1EDE6' }}><SiteNav />{children}</div>;
}

const eyebrowStyle = { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D5222B' };
const labelStyle = { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,237,230,0.55)', marginBottom: '0.6rem' };
const backLinkStyle = { fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#D5222B', textDecoration: 'none', letterSpacing: '0.06em' };
const messageStyle = { maxWidth: '1180px', margin: '0 auto', padding: '140px 2rem 5rem', fontFamily: 'var(--font-mono)' };
const sizeButtonStyle = { padding: '0.5rem 0.85rem', border: '1px solid rgba(241,237,230,0.2)', backgroundColor: 'transparent', color: 'rgba(241,237,230,0.72)', cursor: 'pointer', fontFamily: 'var(--font-mono)', borderRadius: '2px' };
const selectedSizeStyle = { backgroundColor: '#D5222B', borderColor: '#D5222B', color: '#fff' };
const wishlistButtonStyle = { width: '100%', marginTop: '0.6rem', padding: '0.75rem', background: 'transparent', border: '1px solid rgba(217,168,78,0.6)', color: '#D9A84E', fontFamily: 'var(--font-mono)', cursor: 'pointer' };
const reviewInputStyle = { width: '100%', padding: '0.7rem', background: '#1B1917', border: '1px solid rgba(241,237,230,0.18)', color: '#F1EDE6', fontFamily: 'var(--font-mono)' };
const reviewButtonStyle = { justifySelf: 'start', padding: '0.7rem 1rem', border: 0, background: '#D5222B', color: '#fff', fontFamily: 'var(--font-headline)', cursor: 'pointer' };
