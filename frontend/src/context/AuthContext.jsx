/**
 * Auth Context — manages user authentication state.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage
    const savedToken = sessionStorage.getItem('safeid_token');
    const savedUser = sessionStorage.getItem('safeid_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    sessionStorage.setItem('safeid_token', access_token);
    sessionStorage.setItem('safeid_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (full_name, email, phone, password) => {
    const res = await authAPI.register({ full_name, email, phone, password });
    const { access_token, user: userData } = res.data;
    sessionStorage.setItem('safeid_token', access_token);
    sessionStorage.setItem('safeid_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('safeid_token');
    sessionStorage.removeItem('safeid_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
