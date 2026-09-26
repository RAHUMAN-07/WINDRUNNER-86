import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import Footer from '../components/Footer';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`, { headers: { 'x-session-id': sessionStorage.getItem('wr86_session') || '' } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ backgroundColor: '#141312', minHeight: '100vh', color: '#F1EDE6', paddingTop: '64px' }}>
      <SiteNav />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem', fontFamily: 'var(--font-mono)', color: 'rgba(241,237,230,0.3)' }}>
          Loading your order…
        </div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '6rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', color: '#D5222B' }}>Order not found.</p>
          <Link to="/store" style={{ color: '#F1EDE6', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>← Back to Shop</Link>
        </div>
      ) : (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '4rem 2rem' }}>
          {/* Success header */}
          <div style={{
            backgroundColor: '#0d2218',
            border: '1px solid rgba(45,138,78,0.4)',
            padding: '2rem', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '1.5rem',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: '#2D8A4E', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', flexShrink: 0,
            }}>✓</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#2D8A4E', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                ORDER CONFIRMED
              </div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', color: '#F1EDE6', letterSpacing: '0.04em' }}>
                YOUR JACKET IS QUEUED
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(241,237,230,0.5)', marginTop: '0.3rem' }}>
                Ships within 2 business days from Thuvarankurichy
              </p>
            </div>
          </div>

          {/* Order details card */}
          <div style={{ backgroundColor: '#1b1917', border: '1px solid rgba(241,237,230,0.1)', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px dashed rgba(241,237,230,0.12)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>ORDER ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#F1EDE6' }}>{data.order?.id?.slice(0, 16).toUpperCase()}…</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>STATUS</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#F1EDE6', textTransform: 'uppercase' }}>{data.order?.status}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>PAYMENT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#F1EDE6', textTransform: 'uppercase' }}>{data.order?.payment_method}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>TOTAL</div>
                <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', color: '#F1EDE6' }}>₹{Math.round(data.order?.total_amount || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Shipping info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>SHIPPING TO</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(241,237,230,0.7)', lineHeight: 1.7 }}>
                {data.order?.shipping_name}<br />
                {data.order?.shipping_address}<br />
                {data.order?.shipping_city} — {data.order?.shipping_pin}<br />
                📞 {data.order?.shipping_phone}
              </p>
            </div>

            {/* Order items */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                ORDER ITEMS ({data.items?.length})
              </div>
              {data.items?.map(item => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 0', borderBottom: '1px solid rgba(241,237,230,0.06)',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#F1EDE6' }}>{item.product_name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(241,237,230,0.4)', marginTop: '2px' }}>
                      Size {item.size} · Qty {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#D5222B' }}>
                    ₹{Math.round(item.unit_price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tailor's note */}
          <div style={{
            backgroundColor: 'rgba(20,19,18,0.6)',
            border: '1px dashed rgba(241,237,230,0.2)',
            padding: '1.25rem', marginBottom: '2rem',
          }}>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.1rem', color: '#F1EDE6', lineHeight: 1.6 }}>
              "Every jacket is hand-inspected before it leaves Thuvarankurichy. Thank you for your order."
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(241,237,230,0.35)', marginTop: '0.5rem' }}>
              — Abdul Rahuman, Tailor
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/orders" style={{
              backgroundColor: '#D5222B', color: '#fff',
              fontFamily: 'var(--font-headline)', fontSize: '1.1rem',
              padding: '0.8rem 1.5rem', textDecoration: 'none',
              borderRadius: '2px', letterSpacing: '0.04em',
            }}>
              VIEW ALL MY ORDERS
            </Link>
            <Link to="/store" style={{
              backgroundColor: 'transparent', color: '#F1EDE6',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              padding: '0.8rem 1.5rem', textDecoration: 'none',
              border: '1px solid rgba(241,237,230,0.2)',
              borderRadius: '2px', letterSpacing: '0.06em',
            }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
