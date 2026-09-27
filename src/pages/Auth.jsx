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
  boxSizing: 'border-box',
};

function Field({ label, hint, ...props }) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,237,230,0.65)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        {hint && <span style={{ color: '#F5C15B', textTransform: 'none', fontSize: '0.65rem' }}>{hint}</span>}
      </div>
      <input {...props} style={inputStyle} />
    </label>
  );
}

function PasswordField({ label, hint, value, onChange, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <label style={{ display: 'grid', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,237,230,0.65)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        {hint && <span style={{ color: '#F5C15B', textTransform: 'none', fontSize: '0.65rem' }}>{hint}</span>}
      </div>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          {...props}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{ ...inputStyle, paddingRight: '3.2rem' }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute',
            right: '0.6rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: 'rgba(241,237,230,0.6)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            padding: '0.2rem 0.4rem',
          }}
        >
          {show ? 'HIDE' : 'SHOW'}
        </button>
      </div>
    </label>
  );
}

export default function Auth() {
  const { register, login, requestPasswordReset, resetPassword } = useAuth();
  const resetToken = new URLSearchParams(window.location.search).get('token');
  const [mode, setMode] = useState(window.location.pathname === '/reset-password' ? 'reset' : 'login');
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

    if (mode === 'register' && form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address });
      } else if (mode === 'reset') {
        if (!resetToken) {
          await requestPasswordReset(form.email);
          setError('If that email is registered, a password reset link has been dispatched.');
        } else {
          await resetPassword(resetToken, form.password);
        }
      } else {
        await login(form.email, form.password);
      }
    } catch (requestError) {
      setError(requestError.message || 'Request failed. Please check if the server is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEmailAlreadyRegistered = error.toLowerCase().includes('already registered');

  let submitLabel = 'ENTER THE COLLECTION';
  if (submitting) submitLabel = 'CHECKING...';
  else if (mode === 'register') submitLabel = 'CREATE ACCOUNT';
  else if (mode === 'reset') submitLabel = resetToken ? 'SET NEW PASSWORD' : 'SEND RESET LINK';

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
          
          {/* Top Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.8rem', borderBottom: '1px solid rgba(241,237,230,0.12)', paddingBottom: '0.8rem' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'login' ? '2px solid #D5222B' : '2px solid transparent',
                color: mode === 'login' ? '#F1EDE6' : 'rgba(241,237,230,0.4)',
                fontFamily: 'var(--font-headline)',
                fontSize: '1.1rem',
                letterSpacing: '0.06em',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'register' ? '2px solid #D5222B' : '2px solid transparent',
                color: mode === 'register' ? '#F1EDE6' : 'rgba(241,237,230,0.4)',
                fontFamily: 'var(--font-headline)',
                fontSize: '1.1rem',
                letterSpacing: '0.06em',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.14em', color: '#D5222B', marginBottom: '0.75rem' }}>
            MEMBERS ONLY / {mode === 'register' ? 'CREATE ACCESS' : (mode === 'reset' ? 'RECOVER ACCOUNT' : 'WELCOME BACK')}
          </div>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.8rem', lineHeight: 0.95, letterSpacing: '0.04em', marginBottom: '0.8rem' }}>
            {mode === 'register' ? 'REGISTER FIRST' : (mode === 'reset' ? 'RESET PASSWORD' : 'SIGN IN')}
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', lineHeight: 1.6, color: 'rgba(241,237,230,0.52)', marginBottom: '1.8rem' }}>
            {mode === 'register'
              ? 'Create your account to enter the collection, save your cart, and track every order.'
              : 'Enter your credentials to access your saved orders, cart, and profile.'}
          </p>

          <form onSubmit={submit} style={{ display: 'grid', gap: '0.85rem' }}>
            {mode === 'register' && (
              <>
                <Field label="Full name" name="name" value={form.name} onChange={update} required autoComplete="name" />
                <Field label="Phone" name="phone" value={form.phone} onChange={update} required autoComplete="tel" />
                <Field label="Delivery address" name="address" value={form.address} onChange={update} required autoComplete="street-address" />
              </>
            )}

            <Field label="Email" name="email" type="email" value={form.email} onChange={update} required autoComplete="email" />

            {(mode !== 'reset' || resetToken) && (
              <PasswordField
                label="Password"
                hint={mode === 'register' ? 'Min 8 chars' : undefined}
                name="password"
                value={form.password}
                onChange={update}
                required
                minLength={mode === 'register' ? 8 : 1}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            )}

            {mode === 'register' && (
              <PasswordField
                label="Confirm password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={update}
                required
                minLength={8}
                autoComplete="new-password"
              />
            )}

            {error && (
              <div role="alert" style={{ border: '1px solid #D5222B', background: 'rgba(213,34,43,0.12)', color: '#FF8D8D', padding: '0.85rem', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', lineHeight: 1.5 }}>
                <div>{error}</div>
                {isEmailAlreadyRegistered && (
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{
                      marginTop: '0.6rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.75rem',
                      background: '#D5222B',
                      color: '#fff',
                      border: 'none',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Switch to Sign In with this email &rarr;
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '0.45rem',
                padding: '0.95rem',
                border: 'none',
                background: submitting ? '#6E2025' : '#D5222B',
                color: '#fff',
                fontFamily: 'var(--font-headline)',
                fontSize: '1.2rem',
                letterSpacing: '0.08em',
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              {submitLabel}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
            <button
              type="button"
              onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
              style={textButtonStyle}
            >
              {mode === 'register' ? 'Already registered? Sign in' : 'New here? Register first'}
            </button>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('reset'); setError(''); }}
                style={textButtonStyle}
              >
                Forgot password?
              </button>
            )}
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                style={textButtonStyle}
              >
                Back to Sign in
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const textButtonStyle = {
  padding: 0,
  border: 0,
  background: 'none',
  color: '#F5C15B',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  cursor: 'pointer',
};
