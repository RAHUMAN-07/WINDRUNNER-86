import React, { useEffect, useState } from 'react';
import SiteNav from '../components/SiteNav';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const { user, csrfToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadOrders = async () => {
    const response = await fetch('/api/admin/orders', { credentials: 'include' });
    if (!response.ok) throw new Error('Unable to load orders');
    setOrders(await response.json());
  };

  useEffect(() => { if (user.role === 'admin') loadOrders().catch(requestError => setError(requestError.message)); }, [user.role]);

  const updateStatus = async (id, status) => {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error('Unable to update order');
      await loadOrders();
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };

  const updateTracking = async id => {
    const tracking_number = window.prompt('Tracking number');
    if (!tracking_number) return;
    const response = await fetch(`/api/admin/orders/${id}/tracking`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ tracking_number }) });
    if (response.ok) await loadOrders(); else setError('Unable to save tracking number');
  };

  const updateRefund = async (id, status) => {
    const response = await fetch(`/api/admin/orders/${id}/refund`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ refund_status: status }) });
    if (response.ok) await loadOrders(); else setError('Unable to update refund');
  };

  if (user.role !== 'admin') return <main style={pageStyle}><SiteNav /><h1 style={headingStyle}>ACCESS DENIED</h1></main>;
  return (
    <main style={pageStyle}>
      <SiteNav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={eyebrowStyle}>OPERATIONS / ADMIN</div>
        <h1 style={headingStyle}>ORDER CONTROL</h1>
        {error && <p style={{ color: '#FF8D8D', fontFamily: 'var(--font-mono)' }}>{error}</p>}
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {orders.map(order => <div key={order.id} style={rowStyle}>
            <div><strong>{order.id.slice(0, 8).toUpperCase()}</strong><small>{order.shipping_name} / ₹{Math.round(order.total_amount).toLocaleString('en-IN')}</small><small>Tracking: {order.tracking_number || 'not set'} · Refund: {order.refund_status}</small></div>
            <div><small>{order.created_at}</small><select disabled={busy} value={order.status} onChange={event => updateStatus(order.id, event.target.value)} style={selectStyle}><option>pending</option><option>processing</option><option>shipped</option><option>delivered</option><option>cancelled</option></select><button type="button" onClick={() => updateTracking(order.id)} style={adminButtonStyle}>TRACKING</button>{order.refund_status === 'requested' && <button type="button" onClick={() => updateRefund(order.id, 'refunded')} style={adminButtonStyle}>MARK REFUNDED</button>}</div>
          </div>)}
          {orders.length === 0 && <p style={{ color: 'rgba(241,237,230,0.55)', fontFamily: 'var(--font-mono)' }}>No orders found.</p>}
        </div>
      </div>
    </main>
  );
}

const pageStyle = { minHeight: '100vh', background: '#141312', color: '#F1EDE6', paddingTop: '64px' };
const eyebrowStyle = { color: '#D5222B', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em' };
const headingStyle = { fontFamily: 'var(--font-headline)', fontSize: '4rem', lineHeight: 1, margin: '0.5rem 0 2rem' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid rgba(241,237,230,0.12)', background: '#1B1917', fontFamily: 'var(--font-mono)' };
const selectStyle = { display: 'block', marginTop: '0.4rem', padding: '0.45rem', background: '#141312', color: '#F1EDE6', border: '1px solid rgba(241,237,230,0.2)' };
const adminButtonStyle = { marginTop: '0.4rem', marginRight: '0.4rem', padding: '0.45rem', background: '#D5222B', color: '#fff', border: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', cursor: 'pointer' };
