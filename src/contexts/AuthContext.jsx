import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

async function readResponse(response) {
  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    if (!response.ok) {
      if (response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error('Backend server is unreachable (port 4000). Please make sure the backend server is running.');
      }
      throw new Error(`Server returned error status ${response.status}`);
    }
  }
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshCsrf = async () => {
    const response = await fetch('/api/auth/csrf', { credentials: 'include' });
    const data = await readResponse(response);
    setCsrfToken(data.token);
    return data.token;
  };

  const loadUser = async () => {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) return null;
    return response.json();
  };

  useEffect(() => {
    let active = true;
    loadUser()
      .then(async currentUser => {
        if (!currentUser) {
          const refresh = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          if (refresh.ok) currentUser = await loadUser();
        }
        if (!active) return;
        if (currentUser) {
          setUser(currentUser);
          await refreshCsrf();
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const register = async form => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await readResponse(response);
      setUser(await loadUser() || data.user);
      await refreshCsrf();
    } catch (err) {
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        throw new Error('Cannot connect to server. Please verify backend is running on port 4000.');
      }
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await readResponse(response);
      setUser(await loadUser() || data.user);
      await refreshCsrf();
    } catch (err) {
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        throw new Error('Cannot connect to server. Please verify backend is running on port 4000.');
      }
      throw err;
    }
  };

  const updateProfile = async form => {
    const sendUpdate = token => fetch('/api/auth/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': token },
      body: JSON.stringify(form),
    });
    let response = await sendUpdate(csrfToken);
    if (response.status === 403) response = await sendUpdate(await refreshCsrf());
    if (response.status === 401) {
      const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (refreshed.ok) response = await sendUpdate(await refreshCsrf());
    }
    const data = await readResponse(response);
    setUser(data);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': csrfToken } });
    setUser(null);
    setCsrfToken('');
  };

  const requestPasswordReset = async email => {
    const response = await fetch('/api/auth/password-reset/request', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
    });
    return readResponse(response);
  };

  const resetPassword = async (token, password) => {
    const response = await fetch('/api/auth/password-reset/complete', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
    });
    return readResponse(response);
  };

  const contextValue = useMemo(() => ({ user, csrfToken, loading, register, login, logout, updateProfile, requestPasswordReset, resetPassword }), [user, csrfToken, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
