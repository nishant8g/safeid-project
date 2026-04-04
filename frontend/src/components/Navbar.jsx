/**
 * Navbar — Top navigation with auth-aware links.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show navbar on scan pages
  if (location.pathname.startsWith('/scan')) return null;

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛡️</span>
          <span>SafeID</span>
        </Link>

        <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMobileOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/profile" className={isActive('/profile')} onClick={() => setMobileOpen(false)}>
                🩺 Medical
              </Link>
              <Link to="/contacts" className={isActive('/contacts')} onClick={() => setMobileOpen(false)}>
                👥 Contacts
              </Link>
              <Link to="/qr" className={isActive('/qr')} onClick={() => setMobileOpen(false)}>
                📱 QR Code
              </Link>
              <Link to="/nfc" className={isActive('/nfc')} onClick={() => setMobileOpen(false)}>
                📡 NFC Tag
              </Link>
              <Link to="/history" className={isActive('/history')} onClick={() => setMobileOpen(false)}>
                📋 History
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '2rem', margin: '0 auto', color: '#94a3b8', fontSize: '0.95rem' }}>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#94a3b8'}>Features</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#94a3b8'}>Security</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#94a3b8'}>Support</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#94a3b8'}>Pricing</span>
              </div>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <span className="btn-nav-outline">
                  Sign In
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
