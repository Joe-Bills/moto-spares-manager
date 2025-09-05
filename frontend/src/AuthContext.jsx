import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserInfo } from './api';

const AuthContext = createContext();
const BusinessNameContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('businessName') || 'Moto Spares');

  useEffect(() => {
    if (token) {
      fetchUserInfo(token)
        .then(setUser)
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userInfo) => {
    setToken(newToken);
    setUser(userInfo);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateBusinessName = (name) => {
    setBusinessName(name);
    localStorage.setItem('businessName', name);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      <BusinessNameContext.Provider value={{ businessName, updateBusinessName }}>
        {children}
      </BusinessNameContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useBusinessName() {
  return useContext(BusinessNameContext);
} 