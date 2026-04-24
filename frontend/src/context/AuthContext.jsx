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
    const savedToken = sessionStorage.getItem('resq_token');
    const savedUser = sessionStorage.getItem('resq_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (googleToken) => {
    const res = await authAPI.login({ email: "google-auth", password: "google-auth", google_token: googleToken });
    const { access_token, user: userData } = res.data;
    sessionStorage.setItem('resq_token', access_token);
    sessionStorage.setItem('resq_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (googleToken) => {
    const res = await authAPI.register({ email: "google-auth", password: "google-auth", google_token: googleToken });
    const { access_token, user: userData } = res.data;
    sessionStorage.setItem('resq_token', access_token);
    sessionStorage.setItem('resq_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('resq_token');
    sessionStorage.removeItem('resq_user');
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
