import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function SiteNav() {
  const { cart } = useCart();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    fontFamily: 'var(--font-mono)',
    fontSize: '0.82rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: pathname === path ? '#D5222B' : 'rgba(241,237,230,0.7)',
    textDecoration: 'none',
    paddingBottom: '2px',
    borderBottom: pathname === path ? '1px solid #D5222B' : '1px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
  });

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 200,
      height: '64px', padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: 'rgba(20,19,18,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(241,237,230,0.1)',
    }}>
      {/* Wordmark */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'var(--font-headline)', fontSize: '1.6rem', color: '#F1EDE6', letterSpacing: '0.04em' }}>
          WINDRUNNER <span style={{ color: '#D5222B' }}>'86</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/store" style={linkStyle('/store')}>Shop</Link>
        <Link to="/orders" style={linkStyle('/orders')}>My Orders</Link>
        <Link to="/account" style={linkStyle('/account')}>Account</Link>
        {user?.role === 'admin' && <Link to="/admin" style={linkStyle('/admin')}>Admin</Link>}
      </nav>

      {/* Cart badge */}
      <Link to="/store" style={{ textDecoration: 'none', position: 'relative' }}>
        <div style={{
          backgroundColor: '#D5222B', color: '#fff',
          fontFamily: 'var(--font-headline)', fontSize: '1rem',
          padding: '6px 18px', borderRadius: '2px',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          🧺 Cart
          {cart.count > 0 && (
            <span style={{
              backgroundColor: '#fff', color: '#D5222B',
              borderRadius: '50%', fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
              width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold',
            }}>
              {cart.count}
            </span>
          )}
        </div>
      </Link>
    </header>
  );
}
