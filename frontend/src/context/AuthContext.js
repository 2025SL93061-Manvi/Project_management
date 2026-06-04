import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, verify the HttpOnly cookie is valid by calling /me
    // Store only non-sensitive user info in state (no token)
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    api.get('/auth/me')
      .then(res => {
        const info = { name: res.data.name, email: res.data.email, role: res.data.role };
        localStorage.setItem('user', JSON.stringify(info));
        setUser(info);
      })
      .catch(() => {
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    // userData from login response has no token — just name/email/role
    const info = { name: userData.name, email: userData.email, role: userData.role };
    localStorage.setItem('user', JSON.stringify(info));
    setUser(info);
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
