import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0a0908',
      borderTop: '1px solid rgba(241,237,230,0.12)',
      padding: '4rem 2rem 5rem',
      color: 'rgba(241,237,230,0.6)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.82rem',
      position: 'relative',
      zIndex: 40,
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', color: '#F1EDE6', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            WINDRUNNER <span style={{ color: '#D5222B' }}>'86</span>
          </div>
          <p style={{ lineHeight: 1.6 }}>
            Built in Thuvarankurichy, Tamil Nadu.<br />
            Every jacket inspected by hand before shipping.
          </p>
        </div>

        {/* Owner */}
        <div>
          <div style={{ color: '#D5222B', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>STORE OWNER</div>
          <p style={{ lineHeight: 1.8 }}>
            Abdul Rahuman<br />
            Thuvarankurichy<br />
            Trichy dist — 621314<br />
            Tamil Nadu, India
          </p>
        </div>

        {/* Policies */}
        <div>
          <div style={{ color: '#D5222B', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>POLICIES</div>
          <p style={{ lineHeight: 1.8 }}>
            Returns: 14 days — unworn, tags attached<br />
            Shipping: 2 business days<br />
            Payment: COD · UPI · Cards · Net Banking · Wallets<br />
            Zones: Tamil Nadu &amp; PAN India
          </p>
        </div>

        {/* Contact */}
        <div>
          <div style={{ color: '#D5222B', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>CONTACT</div>
          <p style={{ lineHeight: 1.8 }}>
            rahumanabdul0306@gmail.com<br />
            Style No. 0286<br />
            GSTIN: 33AXXXX0000X1Z5
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px dashed rgba(241,237,230,0.12)', textAlign: 'center', letterSpacing: '0.06em' }}>
        © 2024 WINDRUNNER '86 — Abdul Rahuman. Constructed according to 1986 athletics catalogue specifications.
      </div>
    </footer>
  );
}
