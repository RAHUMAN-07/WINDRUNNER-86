import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OpeningAnimation from './components/OpeningAnimation';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Store from './pages/Store';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import Account from './pages/Account';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './index.css';

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ minHeight: '100vh', background: '#141312' }} />;
  if (!user) return <Auth />;

  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/orders" element={<Orders />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
      </Routes>
    </CartProvider>
  );
}

export default function App() {
  const [animDone, setAnimDone] = useState(false);
  const handleAnimComplete = useCallback(() => setAnimDone(true), []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {!animDone ? <OpeningAnimation onComplete={handleAnimComplete} /> : <ProtectedRoutes />}
      </BrowserRouter>
    </AuthProvider>
  );
}
