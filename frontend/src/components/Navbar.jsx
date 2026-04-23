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
              <GetAppButton deferredPrompt={deferredPrompt} onInstall={handleInstallClick} />
              <button className="nav-link" onClick={() => { logout(); setMobileOpen(false); }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="navbar-unauth-links">
              <GetAppButton deferredPrompt={deferredPrompt} onInstall={handleInstallClick} />
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <span className="btn-nav-outline">Sign In</span>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <span className="btn-nav-outline">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Always-visible Get App button with smart fallback modal
function GetAppButton({ deferredPrompt, onInstall }) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (deferredPrompt) {
      onInstall();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          background: 'linear-gradient(135deg, #0061ff, #00f2ff)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '0.5rem 1.1rem',
          fontWeight: '700',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginRight: '0.5rem',
          boxShadow: '0 4px 15px rgba(0, 97, 255, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,97,255,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 97, 255, 0.35)'; }}
      >
        📲 Get App
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d1322', border: '1px solid rgba(0,242,255,0.25)',
              borderRadius: '20px', padding: '2.5rem', maxWidth: '400px', width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📲</div>
            <h3 style={{ color: '#fff', fontWeight: '800', marginBottom: '0.5rem' }}>Install SafeID App</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Follow the steps below to install SafeID on your device as a native app.
            </p>

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#00f2ff', fontWeight: '700', marginBottom: '0.75rem' }}>📱 On Android (Chrome):</p>
              <ol style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.2rem', lineHeight: '2', fontSize: '0.9rem' }}>
                <li>Tap the <strong>⋮ menu</strong> (top right)</li>
                <li>Tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Install"</strong></li>
              </ol>
            </div>

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#00f2ff', fontWeight: '700', marginBottom: '0.75rem' }}>🖥️ On Desktop (Chrome/Edge):</p>
              <ol style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.2rem', lineHeight: '2', fontSize: '0.9rem' }}>
                <li>Look for the <strong>install icon (⊕)</strong> in the address bar</li>
                <li>Click it and select <strong>"Install"</strong></li>
              </ol>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                background: 'linear-gradient(135deg, #0061ff, #00f2ff)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '0.75rem 2rem', fontWeight: '700', cursor: 'pointer',
                width: '100%', fontSize: '1rem',
              }}
            >
              Got it! ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
