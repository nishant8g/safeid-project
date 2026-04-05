/**
 * Navbar — Top navigation with auth-aware links.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
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
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={() => setMobileOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={() => setMobileOpen(false)}>
                🩺 Medical
              </Link>
              <Link to="/contacts" className={`nav-link ${isActive('/contacts')}`} onClick={() => setMobileOpen(false)}>
                👥 Contacts
              </Link>
              <Link to="/qr" className={`nav-link ${isActive('/qr')}`} onClick={() => setMobileOpen(false)}>
                📱 QR Code
              </Link>
              <Link to="/nfc" className={`nav-link ${isActive('/nfc')}`} onClick={() => setMobileOpen(false)}>
                📡 NFC Tag
              </Link>
              <Link to="/history" className={`nav-link ${isActive('/history')}`} onClick={() => setMobileOpen(false)}>
                📋 History
              </Link>
              <button className="nav-link" onClick={() => { logout(); setMobileOpen(false); }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="navbar-unauth-links">
              <div className="unauth-menu-items">
                <span className="unauth-link">Features</span>
                <span className="unauth-link">Security</span>
                <span className="unauth-link">Support</span>
                <span className="unauth-link">Pricing</span>
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

