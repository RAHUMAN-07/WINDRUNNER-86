import React, { useState } from 'react';
import SiteNav from '../components/SiteNav';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function Account() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async event => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile(form);
      setMessage('Profile updated.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update your profile. Please sign in again.');
    }
  };

  return (
    <div style={{ background: '#141312', minHeight: '100vh', color: '#F1EDE6', paddingTop: '64px' }}>
      <SiteNav />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#D5222B', fontSize: '0.7rem', letterSpacing: '0.12em' }}>ACCOUNT / {user.role?.toUpperCase()}</div>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '3.6rem', lineHeight: 1, margin: '0.5rem 0 2rem' }}>YOUR DETAILS</h1>
        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem', background: '#1B1917', border: '1px solid rgba(241,237,230,0.12)', padding: '2rem' }}>
          <label style={labelStyle}>Email<input value={user.email} disabled style={inputStyle} /></label>
          <div style={detailsGrid}>
            <div style={detailStyle}><span>Account role</span><strong>{user.role || 'customer'}</strong></div>
            <div style={detailStyle}><span>Joined</span><strong>{user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'Recently'}</strong></div>
          </div>
          <label style={labelStyle}>Name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required style={inputStyle} /></label>
          <label style={labelStyle}>Phone<input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} required style={inputStyle} /></label>
          <label style={labelStyle}>Address<textarea value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} required rows="4" style={{ ...inputStyle, resize: 'vertical' }} /></label>
          {message && <div style={{ color: '#75D39A', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{message}</div>}
          {error && <div style={{ color: '#FF8D8D', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{error}</div>}
          <button type="submit" style={buttonStyle}>SAVE DETAILS</button>
        </form>
        <button type="button" onClick={logout} style={logoutButtonStyle}>LOG OUT OF ACCOUNT</button>
      </main>
      <Footer />
    </div>
  );
}

const labelStyle = { display: 'grid', gap: '0.4rem', color: 'rgba(241,237,230,0.65)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '0.8rem', background: '#141312', color: '#F1EDE6', border: '1px solid rgba(241,237,230,0.18)', fontFamily: 'var(--font-mono)' };
const buttonStyle = { padding: '0.9rem', border: 0, background: '#D5222B', color: '#fff', fontFamily: 'var(--font-headline)', fontSize: '1.1rem', letterSpacing: '0.06em', cursor: 'pointer' };
const detailsGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.8rem' };
const detailStyle = { display: 'grid', gap: '0.3rem', padding: '0.8rem', background: '#141312', border: '1px solid rgba(241,237,230,0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(241,237,230,0.5)', textTransform: 'uppercase' };
const logoutButtonStyle = { marginTop: '1rem', padding: '0.8rem 1rem', border: '1px solid rgba(213,34,43,0.65)', background: 'transparent', color: '#FF8D8D', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', cursor: 'pointer' };
