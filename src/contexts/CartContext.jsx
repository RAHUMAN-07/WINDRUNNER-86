import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const SESSION_KEY = 'wr86_session';

function getSession() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${crypto.randomUUID()}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function CartProvider({ children }) {
  const { csrfToken } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const sessionId = getSession();

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', {
        credentials: 'include',
        headers: { 'x-session-id': sessionId }
      });
      if (res.ok) setCart(await res.json());
    } catch (e) { console.error('cart fetch', e); }
  }, [sessionId]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (product_id, size, quantity = 1) => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId, 'x-csrf-token': csrfToken },
        body: JSON.stringify({ product_id, size, quantity })
      });
      if (res.ok) setCart(await res.json());
    } catch (e) { console.error('add to cart', e); }
    finally { setLoading(false); }
  }, [sessionId, csrfToken]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'x-session-id': sessionId, 'x-csrf-token': csrfToken }
      });
      if (res.ok) fetchCart();
    } catch (e) { console.error('remove cart', e); }
  }, [sessionId, csrfToken, fetchCart]);

  const updateQty = useCallback(async (itemId, quantity) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId, 'x-csrf-token': csrfToken },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) fetchCart();
    } catch (e) { console.error('update qty', e); }
  }, [sessionId, csrfToken, fetchCart]);

  const placeOrder = useCallback(async (shipping, payment_method = 'cod', payment = null, coupon_code = null) => {
    const idempotencyKey = `order_${crypto.randomUUID()}`;
    const res = await fetch('/api/orders', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId, 'x-csrf-token': csrfToken, 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ shipping, payment_method, payment, coupon_code })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Order failed');
    const data = await res.json();
    // Persist order ID for the Orders history page (guest session)
    const storedIds = JSON.parse(sessionStorage.getItem('wr86_order_ids') || '[]');
    storedIds.unshift(data.order.id);
    sessionStorage.setItem('wr86_order_ids', JSON.stringify(storedIds.slice(0, 20)));
    await fetchCart();
    return data;
  }, [sessionId, csrfToken, fetchCart]);

  const contextValue = useMemo(() => ({ cart, loading, addToCart, removeFromCart, updateQty, placeOrder, fetchCart }), [cart, loading, addToCart, removeFromCart, updateQty, placeOrder, fetchCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
