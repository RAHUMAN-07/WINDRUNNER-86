import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  'All',
  'Windrunner Heritage',
  'Technical Storm Shell',
  'Thermal Puffer',
  'Varsity Bomber',
  'Coach Windbreaker',
];

function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const handleAdd = () => {
    onAddToCart(product.id, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{
      backgroundColor: '#1b1917',
      border: '1px solid rgba(241,237,230,0.1)',
      display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.25s, transform 0.25s',
      borderRadius: '2px',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(213,34,43,0.5)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(241,237,230,0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Category Image */}
      <div style={{ height: '300px', overflow: 'hidden', backgroundColor: '#100f0e', position: 'relative' }}>
        <img
          onClick={() => navigate(`/product/${product.id}`)}
          src={product.image || '/renders/hero_assembled.jpg'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Category Pill Tag */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          backgroundColor: 'rgba(20,19,18,0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(213,34,43,0.4)',
          color: '#D5222B',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          padding: '3px 8px',
          textTransform: 'uppercase',
          borderRadius: '2px',
        }}>
          {product.category || 'Jacket'}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#D5222B', letterSpacing: '0.08em' }}>
              {product.style_no}
            </span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', color: '#F1EDE6', marginTop: '0.2rem', lineHeight: 1.2 }}>
              {product.name}
            </h3>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: '#D5222B', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
            ₹{Math.round(product.price).toLocaleString('en-IN')}
          </span>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'rgba(241,237,230,0.6)', lineHeight: 1.5 }}>
          {product.colorway}
        </p>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(241,237,230,0.45)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>

        {/* Sizes */}
        <div style={{ marginTop: '0.25rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(241,237,230,0.5)', marginBottom: '0.35rem' }}>SELECT SIZE</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(s => (
              <button key={s} onClick={() => setSelectedSize(s)} style={{
                padding: '4px 10px',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                backgroundColor: selectedSize === s ? '#D5222B' : 'transparent',
                color: selectedSize === s ? '#fff' : 'rgba(241,237,230,0.6)',
                border: `1px solid ${selectedSize === s ? '#D5222B' : 'rgba(241,237,230,0.2)'}`,
                cursor: 'pointer', borderRadius: '2px',
                transition: 'all 0.15s ease',
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Stock */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: product.stock > 5 ? 'rgba(241,237,230,0.4)' : '#D5222B' }}>
          {product.stock > 0 ? `● ${product.stock} in stock · Ships in 2 days` : 'Out of stock'}
        </div>

        {/* Add to cart */}
        <button onClick={() => navigate(`/product/${product.id}`)} style={{
          marginTop: 'auto',
          backgroundColor: 'transparent',
          color: '#F1EDE6', border: '1px solid rgba(241,237,230,0.22)', padding: '0.65rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em',
          cursor: 'pointer', borderRadius: '2px',
        }}>
          VIEW FULL JACKET DETAILS →
        </button>
        <button onClick={handleAdd} disabled={product.stock === 0} style={{
          backgroundColor: added ? '#2D8A4E' : '#D5222B',
          color: '#fff', border: 'none', padding: '0.75rem',
          fontFamily: 'var(--font-headline)', fontSize: '1.1rem', letterSpacing: '0.04em',
          cursor: 'pointer', borderRadius: '2px',
          transition: 'background-color 0.25s',
        }}>
          {added ? '✓ ADDED TO CART' : 'ADD TO CART — ₹1,500'}
        </button>
      </div>
    </div>
  );
}

function CartSidebar({ onCheckout }) {
  const { cart, removeFromCart, updateQty } = useCart();

  return (
    <div style={{
      position: 'sticky', top: '80px', height: 'fit-content',
      backgroundColor: '#1b1917', border: '1px solid rgba(241,237,230,0.12)',
      padding: '1.5rem', minWidth: '280px',
    }}>
      <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.4rem', color: '#F1EDE6', marginBottom: '1rem', borderBottom: '1px dashed rgba(241,237,230,0.15)', paddingBottom: '0.8rem' }}>
        CART — {cart.count} ITEMS
      </div>

      {cart.items.length === 0 ? (
        <p style={{ color: 'rgba(241,237,230,0.4)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {cart.items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(241,237,230,0.07)' }}>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#F1EDE6' }}>{item.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(241,237,230,0.4)', marginTop: '2px' }}>Size {item.size}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} style={qtyBtn}>−</button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#F1EDE6', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} style={qtyBtn}>+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#D5222B' }}>
                    ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(241,237,230,0.3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>✕ remove</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed rgba(241,237,230,0.15)', paddingTop: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(241,237,230,0.6)' }}>TOTAL</span>
            <span style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', color: '#F1EDE6' }}>
              ₹{Math.round(cart.total).toLocaleString('en-IN')}
            </span>
          </div>

          <button onClick={onCheckout} style={{
            width: '100%', backgroundColor: '#D5222B', color: '#fff',
            fontFamily: 'var(--font-headline)', fontSize: '1.2rem', letterSpacing: '0.04em',
            padding: '0.9rem', border: 'none', borderRadius: '2px', cursor: 'pointer',
          }}>
            CHECKOUT →
          </button>
        </>
      )}
    </div>
  );
}

const qtyBtn = {
  width: '24px', height: '24px',
  backgroundColor: 'rgba(241,237,230,0.06)', border: '1px solid rgba(241,237,230,0.15)',
  color: '#F1EDE6', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px',
};

function CheckoutForm({ onOrderPlaced }) {
  const { placeOrder, cart } = useCart();
  const { csrfToken } = useAuth();
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', pin: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleChange = e => setShipping(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      let payment = null;
      if (paymentMethod !== 'cod') {
        const paymentResponse = await fetch('/api/payments/create', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-session-id': sessionStorage.getItem('wr86_session') || '', 'x-csrf-token': csrfToken },
          body: JSON.stringify({ coupon_code: couponCode || null }),
        });
        const paymentOrder = await paymentResponse.json();
        if (!paymentResponse.ok) throw new Error(paymentOrder.error || 'Unable to start payment');
        await loadRazorpayScript();
        payment = await openRazorpayCheckout(paymentOrder, paymentMethod, shipping);
      }
      const data = await placeOrder(shipping, paymentMethod, payment, couponCode || null);
      onOrderPlaced(data.order.id);
    } catch (err) {
      setError(err.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#1b1917', border: '1px solid rgba(241,237,230,0.12)', padding: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', color: '#F1EDE6', marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
        SHIPPING DETAILS
      </h2>
      {error && <div style={{ color: '#D5222B', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '1rem', padding: '8px', border: '1px solid #D5222B' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={labelStyle}>
          Full Name
          <input name="name" value={shipping.name} onChange={handleChange} required placeholder="Abdul Rahuman" style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Delivery Address
          <input name="address" value={shipping.address} onChange={handleChange} required placeholder="Street, Area" style={inputStyle} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label style={labelStyle}>
            City
            <input name="city" value={shipping.city} onChange={handleChange} required placeholder="Thuvarankurichy / Trichy" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            PIN Code
            <input name="pin" value={shipping.pin} onChange={handleChange} required placeholder="621314" style={inputStyle} />
          </label>
        </div>
        <label style={labelStyle}>
          Phone Number
          <input name="phone" value={shipping.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Payment Method
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inputStyle}>
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI (Google Pay, PhonePe, Paytm)</option>
            <option value="card">Credit / Debit Card</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Digital Wallet</option>
          </select>
        </label>

        <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(20,19,18,0.6)', border: '1px dashed rgba(241,237,230,0.15)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(241,237,230,0.5)' }}>
          Selected payment: {PAYMENT_METHODS[paymentMethod]} · Ships directly from Thuvarankurichy, Tamil Nadu within 2 business days
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={couponCode} onChange={event => setCouponCode(event.target.value.toUpperCase())} placeholder="Coupon code" style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={async () => { const response = await fetch('/api/coupons/validate', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify({ code: couponCode, subtotal: cart.total }) }); const data = await response.json(); if (response.ok) { setDiscount(data.discount); setCouponMessage(`Saved ₹${Math.round(data.discount)}`); } else setCouponMessage(data.error); }} style={couponButtonStyle}>APPLY</button>
        </div>
        {couponMessage && <div style={{ color: discount ? '#75D39A' : '#FF8D8D', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{couponMessage}</div>}

        <button type="submit" disabled={loading || cart.count === 0} style={{
          backgroundColor: loading ? '#555' : '#D5222B', color: '#fff',
          fontFamily: 'var(--font-headline)', fontSize: '1.4rem', letterSpacing: '0.04em',
          padding: '1rem', border: 'none', borderRadius: '2px',
          cursor: loading ? 'wait' : 'pointer', marginTop: '0.5rem',
        }}>
          {loading ? 'PLACING ORDER…' : `PLACE ORDER — ₹${Math.round(cart.total - discount).toLocaleString('en-IN')}`}
        </button>
      </form>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load payment checkout'));
    document.body.appendChild(script);
  });
}

function openRazorpayCheckout(paymentOrder, paymentMethod, shipping) {
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: paymentOrder.key_id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: "WINDRUNNER '86",
      description: `Jacket order via ${PAYMENT_METHODS[paymentMethod]}`,
      order_id: paymentOrder.order_id,
      prefill: { name: shipping.name, contact: shipping.phone },
      notes: { address: shipping.address },
      handler: response => resolve(response),
      modal: { ondismiss: () => reject(new Error('Payment was cancelled')) },
    });
    checkout.open();
  });
}

const PAYMENT_METHODS = {
  cod: 'Cash on Delivery',
  upi: 'UPI',
  card: 'Credit / Debit Card',
  netbanking: 'Net Banking',
  wallet: 'Digital Wallet',
};

const labelStyle = { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#D5222B', letterSpacing: '0.08em', display: 'flex', flexDirection: 'column', gap: '0.4rem' };
const inputStyle = { backgroundColor: 'rgba(20,19,18,0.8)', border: '1px solid rgba(241,237,230,0.15)', color: '#F1EDE6', fontFamily: 'var(--font-body)', fontSize: '0.95rem', padding: '0.6rem 0.8rem', borderRadius: '2px', outline: 'none' };
const couponButtonStyle = { padding: '0.6rem 0.9rem', background: '#D9A84E', color: '#141312', border: 0, fontFamily: 'var(--font-mono)', cursor: 'pointer' };

export default function Store() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('shop'); // 'shop' | 'checkout'
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (search.trim()) params.set('search', search.trim());
    const url = `/api/products${params.toString() ? `?${params}` : ''}`;
    fetch(url)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCategory, search]);

  const handleOrderPlaced = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <div style={{ backgroundColor: '#141312', minHeight: '100vh', color: '#F1EDE6', paddingTop: '64px' }}>
      <SiteNav />

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0808 0%, #2d0c0c 40%, #141312 100%)',
        borderBottom: '1px solid rgba(213,34,43,0.2)',
        padding: '3rem 2rem 2.5rem',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#D5222B', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
          CUTTING TABLE CATALOGUE · ALL JACKETS ₹1,500
        </div>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: '#F1EDE6', letterSpacing: '0.04em' }}>
          SHOP BY CATEGORY
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'rgba(241,237,230,0.5)', marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          Every jacket is inspected and hand-packed at the bench by Abdul Rahuman · Thuvarankurichy, Tamil Nadu
        </p>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1rem 2rem 0' }}>
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search jackets, colorways, or style numbers" aria-label="Search jackets" style={{ width: '100%', maxWidth: '520px', padding: '0.8rem 1rem', background: '#1B1917', border: '1px solid rgba(241,237,230,0.2)', color: '#F1EDE6', fontFamily: 'var(--font-mono)' }} />
      </div>

      {/* Category selector tabs */}
      <div style={{
        backgroundColor: '#181715',
        borderBottom: '1px solid rgba(241,237,230,0.1)',
        padding: '0.75rem 2rem',
        overflowX: 'auto',
      }}>
        <div style={{
          maxWidth: '1300px', margin: '0 auto', display: 'flex', gap: '0.6rem', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(241,237,230,0.4)', textTransform: 'uppercase', marginRight: '0.5rem', whiteSpace: 'nowrap' }}>
            CATEGORIES:
          </span>
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isActive ? '#D5222B' : 'rgba(241,237,230,0.05)',
                  color: isActive ? '#FFFFFF' : 'rgba(241,237,230,0.7)',
                  border: `1px solid ${isActive ? '#D5222B' : 'rgba(241,237,230,0.15)'}`,
                  padding: '6px 14px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab toggle (Products vs Checkout) */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(241,237,230,0.1)', backgroundColor: '#131211' }}>
        {['shop', 'checkout'].map(t => (
          <button key={t} onClick={() => setView(t)} style={{
            padding: '0.9rem 2rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            backgroundColor: 'transparent', border: 'none',
            borderBottom: view === t ? '2px solid #D5222B' : '2px solid transparent',
            color: view === t ? '#D5222B' : 'rgba(241,237,230,0.4)',
            cursor: 'pointer', transition: 'color 0.2s',
          }}>
            {t === 'shop' ? `01 // Products (${products.length})` : `02 // Checkout${cart.count > 0 ? ` (${cart.count})` : ''}`}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {view === 'shop' ? (
          <>
            {/* Products grid */}
            <div style={{ flexGrow: 1 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', color: 'rgba(241,237,230,0.3)' }}>
                  Loading category collection…
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-mono)', color: 'rgba(241,237,230,0.4)' }}>
                  No jackets found in this category.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.75rem' }}>
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                  ))}
                </div>
              )}
            </div>
            {/* Cart sidebar */}
            <CartSidebar onCheckout={() => setView('checkout')} />
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', width: '100%', alignItems: 'flex-start' }}>
            <CheckoutForm onOrderPlaced={handleOrderPlaced} />
            <CartSidebar onCheckout={() => {}} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
