import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLOR = {
  pending:    '#D9A84E',
  processing: '#3B82F6',
  shipped:    '#2D8A4E',
  delivered:  '#2D8A4E',
  cancelled:  '#D5222B',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, csrfToken } = useAuth();
  const [actionMessage, setActionMessage] = useState('');

  const cancelOrder = async orderId => {
    const response = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ reason: 'Customer requested cancellation' }) });
    if (!response.ok) return setActionMessage((await response.json()).error || 'Unable to cancel order');
    setActionMessage('Order cancelled.');
    setOrders(current => current.map(entry => entry.order.id === orderId ? { ...entry, order: { ...entry.order, status: 'cancelled' } } : entry));
  };

  // Guest: we can't list orders by user (no auth yet), so we store order IDs in sessionStorage
  useEffect(() => {
    fetch('/api/orders', { credentials: 'include' })
      .then(response => response.ok ? response.json() : [])
      .then(summary => Promise.all(summary.map(order => fetch(`/api/orders/${order.id}`, { credentials: 'include' }).then(response => response.ok ? response.json() : null))))
      .then(results => { setOrders(results.filter(Boolean)); setLoading(false); })
      .catch(() => { setOrders([]); setLoading(false); });
  }, [user.id]);

  return (
    <div style={{ backgroundColor: '#141312', minHeight: '100vh', color: '#F1EDE6', paddingTop: '64px' }}>
      <SiteNav />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0e0b1a 0%, #1a1528 40%, #141312 100%)',
        borderBottom: '1px solid rgba(241,237,230,0.08)',
        padding: '3rem 2rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#D5222B', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            ORDER HISTORY
          </div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#F1EDE6', letterSpacing: '0.04em' }}>
            MY ORDERS
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'rgba(241,237,230,0.4)', marginTop: '0.4rem' }}>
            All orders shipped from Thuvarankurichy, Tamil Nadu by Abdul Rahuman
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {actionMessage && <div style={{ color: '#D9A84E', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '1rem' }}>{actionMessage}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', color: 'rgba(241,237,230,0.3)' }}>
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            backgroundColor: '#1b1917',
            border: '1px dashed rgba(241,237,230,0.15)',
            padding: '4rem', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', color: '#F1EDE6', marginBottom: '0.5rem' }}>
              NO ORDERS YET
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(241,237,230,0.4)', marginBottom: '1.5rem' }}>
              You haven't placed any orders yet.
            </p>
            <Link to="/store" style={{
              backgroundColor: '#D5222B', color: '#fff',
              fontFamily: 'var(--font-headline)', fontSize: '1.1rem',
              padding: '0.8rem 1.5rem', textDecoration: 'none',
              borderRadius: '2px', letterSpacing: '0.04em',
            }}>
              SHOP THE COLLECTION
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map(({ order, items }) => (
              <div key={order.id} style={{
                backgroundColor: '#1b1917',
                border: '1px solid rgba(241,237,230,0.1)',
                padding: '1.5rem',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(213,34,43,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(241,237,230,0.1)'}
              >
                {/* Order header row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px dashed rgba(241,237,230,0.1)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>ORDER ID</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#F1EDE6' }}>{order.id.slice(0, 18).toUpperCase()}…</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>DATE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'rgba(241,237,230,0.7)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>STATUS</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                      color: STATUS_COLOR[order.status] || '#F1EDE6',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>● {order.status}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>TOTAL</div>
                    <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', color: '#F1EDE6' }}>
                      ₹{Math.round(order.total_amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Shipping + items */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>SHIPPING TO</div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(241,237,230,0.6)', lineHeight: 1.6 }}>
                      {order.shipping_name}<br />
                      {order.shipping_city}, {order.shipping_pin}
                    </p>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>ITEMS ({items.length})</div>
                    {items.map(item => (
                      <div key={item.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(241,237,230,0.7)', lineHeight: 1.8 }}>
                        {item.product_name} — Size {item.size} × {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>

                {/* View detail link */}
                <Link to={`/order/${order.id}`} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  color: '#D5222B', textDecoration: 'none', letterSpacing: '0.06em',
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  VIEW FULL ORDER DETAILS →
                </Link>
                  {(order.status === 'pending' || order.status === 'processing') && <button type="button" onClick={() => cancelOrder(order.id)} style={cancelButtonStyle}>CANCEL ORDER</button>}
                  {order.tracking_number && <div style={trackingStyle}>TRACKING: {order.tracking_number}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

const cancelButtonStyle = { marginLeft: '1rem', border: 0, background: 'transparent', color: '#FF8D8D', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer' };
const trackingStyle = { marginTop: '0.6rem', color: '#D9A84E', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' };
