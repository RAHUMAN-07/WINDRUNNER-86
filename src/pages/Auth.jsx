import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '0.85rem 0.9rem',
  background: '#141312',
  border: '1px solid rgba(241,237,230,0.18)',
  color: '#F1EDE6',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  outline: 'none',
};

function Field({ label, ...props }) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,237,230,0.65)' }}>
      {label}
      <input {...props} style={inputStyle} />
    </label>
  );
}

export default function Auth() {
  const { register, login, requestPasswordReset, resetPassword } = useAuth();
  const resetToken = new URLSearchParams(window.location.search).get('token');
  const [mode, setMode] = useState(window.location.pathname === '/reset-password' ? 'reset' : 'register');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== '/verify-email') return;
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(resetToken || '')}`)
      .then(response => response.json())
      .then(data => { setMode('login'); setError(data.error || 'Email verified. You can sign in now.'); })
      .catch(() => setError('Unable to verify this email.'));
  }, [resetToken]);

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    setError('');
    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'register') {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address });
      } else if (mode === 'reset') {
        if (!resetToken) await requestPasswordReset(form.email);
        else await resetPassword(resetToken, form.password);
      } else {
        await login(form.email, form.password);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };
  let submitLabel = 'ENTER THE COLLECTION';
  if (submitting) submitLabel = 'CHECKING...';
  else if (mode === 'register') submitLabel = 'CREATE ACCOUNT';

  return (
    <main className="auth-screen" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(360px, 0.9fr)', background: '#141312', color: '#F1EDE6' }}>
      <section className="auth-visual" style={{ minHeight: '100vh', padding: 'clamp(2rem, 6vw, 6rem)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: "linear-gradient(135deg, rgba(213,34,43,0.78), rgba(20,19,18,0.2)), url('/renders/hero_assembled.jpg') center / cover" }}>
        <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', letterSpacing: '0.08em' }}>WINDRUNNER <span style={{ color: '#F5C15B' }}>'86</span></div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.16em', marginBottom: '1rem' }}>THE TAILOR'S BENCH / 0286</div>
          <h1 style={{ maxWidth: '680px', fontFamily: 'var(--font-headline)', fontSize: 'clamp(3.4rem, 8vw, 7rem)', lineHeight: 0.9, letterSpacing: '0.02em' }}>Built for the weather between places.</h1>
        </div>
      </section>

      <section style={{ display: 'flex', alignItems: 'center', padding: 'clamp(1.5rem, 5vw, 5rem)', background: '#1B1917' }}>
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.14em', color: '#D5222B', marginBottom: '0.75rem' }}>
            MEMBERS ONLY / {mode === 'register' ? 'CREATE ACCESS' : 'WELCOME BACK'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '3rem', lineHeight: 0.95, letterSpacing: '0.04em', marginBottom: '0.8rem' }}>
            {mode === 'register' ? 'REGISTER FIRST' : 'SIGN IN'}
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', lineHeight: 1.6, color: 'rgba(241,237,230,0.52)', marginBottom: '1.8rem' }}>
            Create your account to enter the collection, save your cart, and track every order.
          </p>

          <form onSubmit={submit} style={{ display: 'grid', gap: '0.85rem' }}>
            {mode === 'register' && <>
              <Field label="Full name" name="name" value={form.name} onChange={update} required autoComplete="name" />
              <Field label="Phone" name="phone" value={form.phone} onChange={update} required autoComplete="tel" />
              <Field label="Delivery address" name="address" value={form.address} onChange={update} required autoComplete="street-address" />
            </>}
            <Field label="Email" name="email" type="email" value={form.email} onChange={update} required autoComplete="email" />
            {mode !== 'reset' || resetToken ? <Field label="Password" name="password" type="password" value={form.password} onChange={update} required minLength={12} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /> : null}
            {mode === 'register' && <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required minLength={12} autoComplete="new-password" />}
            {error && <div role="alert" style={{ border: '1px solid #D5222B', color: '#FF8D8D', padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{error}</div>}
            <button type="submit" disabled={submitting} style={{ marginTop: '0.45rem', padding: '0.95rem', border: 'none', background: submitting ? '#6E2025' : '#D5222B', color: '#fff', fontFamily: 'var(--font-headline)', fontSize: '1.2rem', letterSpacing: '0.08em', cursor: submitting ? 'wait' : 'pointer' }}>
              {mode === 'reset' && !resetToken ? 'SEND RESET LINK' : submitLabel}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
            <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }} style={textButtonStyle}>{mode === 'register' ? 'Already registered? Sign in' : 'New here? Register first'}</button>
            {mode === 'login' && <button type="button" onClick={() => { setMode('reset'); setError(''); }} style={textButtonStyle}>Forgot password?</button>}
          </div>
        </div>
      </section>
    </main>
  );
}

const textButtonStyle = { padding: 0, border: 0, background: 'none', color: '#F5C15B', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' };
