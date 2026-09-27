import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Checkout({ total = 0 }) {
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', pin: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { placeOrder } = useCart();

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await placeOrder(shipping, paymentMethod);
      if (data?.order?.id) {
        navigate(`/order/${data.order.id}`);
      }
    } catch (err) {
      console.error('Order error', err);
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '2rem', backgroundColor: '#141312', color: '#f1ede6' }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', marginBottom: '1rem' }}>Checkout</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <input name="name" placeholder="Full Name" value={shipping.name} onChange={handleChange} required style={inputStyle} />
        <input name="address" placeholder="Address" value={shipping.address} onChange={handleChange} required style={inputStyle} />
        <input name="city" placeholder="City" value={shipping.city} onChange={handleChange} required style={inputStyle} />
        <input name="pin" placeholder="Pin Code" value={shipping.pin} onChange={handleChange} required style={inputStyle} />
        <input name="phone" placeholder="Phone" value={shipping.phone} onChange={handleChange} required style={inputStyle} />
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inputStyle}>
          <option value="cod">Cash on Delivery</option>
          <option value="upi">UPI (Google Pay, PhonePe, Paytm)</option>
          <option value="card">Credit / Debit Card</option>
          <option value="netbanking">Net Banking</option>
          <option value="wallet">Digital Wallet</option>
        </select>
        {error && (
          <div style={{ color: '#ff6b6b', background: 'rgba(213,34,43,0.15)', border: '1px solid #d5222b', padding: '0.6rem', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Placing…' : `Pay ₹${total.toFixed(2)}`}
        </button>
      </form>
    </section>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.6rem',
  marginBottom: '0.8rem',
  background: 'rgba(20,19,18,0.6)',
  border: '1px solid rgba(241,237,230,0.2)',
  color: '#f1ede6',
  fontFamily: 'var(--font-mono)'
};

const buttonStyle = {
  backgroundColor: '#D5222B',
  color: '#fff',
  border: 'none',
  padding: '0.8rem 1.2rem',
  cursor: 'pointer',
  fontFamily: 'var(--font-headline)',
  fontSize: '1rem'
};
