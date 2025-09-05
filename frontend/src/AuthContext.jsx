import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserInfo, getBusinessSettings, updateBusinessSettings } from './api';

const AuthContext = createContext();
const BusinessNameContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('businessName') || 'Moto Spares');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'TZS');

  useEffect(() => {
    if (token) {
      console.log('AuthContext: Starting authentication with token:', token.substring(0, 20) + '...');
      
      Promise.all([
        fetchUserInfo(token),
        getBusinessSettings(token).catch((error) => {
          console.log('AuthContext: Business settings failed, using defaults:', error);
          return { business_name: 'Moto Spares', currency: 'TZS' };
        })
      ])
        .then(([userInfo, settings]) => {
          console.log('AuthContext: Authentication successful:', { userInfo, settings });
          setUser(userInfo);
          setBusinessName(settings.business_name);
          setCurrency(settings.currency);
          localStorage.setItem('businessName', settings.business_name);
          localStorage.setItem('currency', settings.currency);
        })
        .catch((error) => {
          console.error('AuthContext: Authentication failed:', error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => {
          console.log('AuthContext: Authentication process completed');
          setLoading(false);
        });
    } else {
      console.log('AuthContext: No token, setting user to null');
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

  const updateBusinessName = async (name) => {
    if (token) {
      try {
        await updateBusinessSettings(token, { business_name: name });
        setBusinessName(name);
        localStorage.setItem('businessName', name);
      } catch (error) {
        console.error('Failed to update business name:', error);
        // Fallback to local storage only
        setBusinessName(name);
        localStorage.setItem('businessName', name);
      }
    } else {
      setBusinessName(name);
      localStorage.setItem('businessName', name);
    }
  };

  const updateCurrency = async (newCurrency) => {
    if (token) {
      try {
        await updateBusinessSettings(token, { currency: newCurrency });
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
      } catch (error) {
        console.error('Failed to update currency:', error);
        // Fallback to local storage only
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
      }
    } else {
      setCurrency(newCurrency);
      localStorage.setItem('currency', newCurrency);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      <BusinessNameContext.Provider value={{ businessName, updateBusinessName, currency, updateCurrency }}>
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