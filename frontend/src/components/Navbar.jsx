import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install Result: ${outcome}`);
    setDeferredPrompt(null);
  };

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

              {deferredPrompt && (
                <button className="nav-link install-btn" onClick={handleInstallClick} style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                  📲 Get Mobile App
                </button>
              )}
              <button className="nav-link" onClick={() => { logout(); setMobileOpen(false); }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="navbar-unauth-links">
              {deferredPrompt && (
                <button className="btn-nav-outline" onClick={handleInstallClick} style={{ marginRight: '1rem', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>
                  📲 Get App
                </button>
              )}
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

