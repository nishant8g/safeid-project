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

// Detect platform
function getPlatform() {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isAndroid = /android/i.test(ua);
  if (isIos && isSafari) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

// Always-visible Get App button — shows a unified premium modal for ALL platforms
function GetAppButton({ deferredPrompt, onInstall }) {
  const [showModal, setShowModal] = useState(false);
  const platform = getPlatform();

  const steps = {
    ios: [
      { icon: '⬆️', label: 'Tap the Share icon', sub: 'At the bottom of your Safari browser' },
      { icon: '➕', label: 'Tap "Add to Home Screen"', sub: 'Scroll down in the share sheet to find it' },
      { icon: '✅', label: 'Tap "Add"', sub: 'SafeID icon will appear on your home screen' },
    ],
    android: [
      { icon: '⋮', label: 'Tap the menu icon', sub: 'Top-right corner of Chrome browser' },
      { icon: '📲', label: 'Tap "Add to Home screen"', sub: 'Or tap "Install App" if visible' },
      { icon: '✅', label: 'Tap "Install"', sub: 'SafeID icon appears on your home screen' },
    ],
    desktop: [
      { icon: '⊕', label: 'Click the install icon', sub: 'Look in the right side of your address bar' },
      { icon: '🖱️', label: 'Click "Install"', sub: 'In the popup that appears from Chrome or Edge' },
      { icon: '✅', label: 'Done!', sub: 'SafeID opens as a standalone desktop app' },
    ],
  };

  const platformMeta = {
    ios:     { emoji: '🍎', title: 'Add to iPhone / iPad', subtitle: 'Install via Safari — 3 quick steps' },
    android: { emoji: '🤖', title: 'Install on Android',   subtitle: 'Install via Chrome — 3 quick steps' },
    desktop: { emoji: '🖥️', title: 'Install on Your PC',   subtitle: 'Install via Chrome or Edge browser' },
  };

  const { emoji, title, subtitle } = platformMeta[platform];
  const currentSteps = steps[platform];

  return (
    <>
      {/* Always-visible Get App button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: 'linear-gradient(135deg, #0061ff, #00f2ff)',
          color: '#fff', border: 'none', borderRadius: '10px',
          padding: '0.5rem 1.1rem', fontWeight: '700', fontSize: '0.9rem',
          cursor: 'pointer', marginRight: '0.5rem',
          boxShadow: '0 4px 15px rgba(0, 97, 255, 0.35)',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,97,255,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 97, 255, 0.35)'; }}
      >
        📲 Get App
      </button>

      {/* Unified premium modal for ALL platforms */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(160deg, #0e1628 0%, #0a1120 100%)',
              border: '1px solid rgba(0,242,255,0.25)',
              borderRadius: '24px', padding: '2rem',
              maxWidth: '380px', width: '92vw',
              boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
              textAlign: 'center',
            }}
          >
            {/* Header */}
            <div style={{ fontSize: '2.8rem', marginBottom: '0.6rem' }}>{emoji}</div>
            <h3 style={{ color: '#fff', fontWeight: '900', margin: '0 0 0.3rem', fontSize: '1.3rem' }}>{title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginBottom: '1.6rem' }}>{subtitle}</p>

            {/* Step cards */}
            {currentSteps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '0.85rem 1rem',
                marginBottom: '0.55rem', textAlign: 'left',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(0,97,255,0.3), rgba(0,242,255,0.3))',
                  border: '1px solid rgba(0,242,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: '900', color: '#00f2ff',
                }}>{step.icon}</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', marginBottom: '2px' }}>{step.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.76rem' }}>{step.sub}</div>
                </div>
              </div>
            ))}

            {/* Install Now button for Chrome/Edge (if native prompt available) */}
            {deferredPrompt && (
              <button
                onClick={() => { onInstall(); setShowModal(false); }}
                style={{
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, #0061ff, #00c6ff)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  padding: '0.85rem', fontWeight: '900', cursor: 'pointer',
                  width: '100%', fontSize: '1rem',
                  boxShadow: '0 8px 25px rgba(0,97,255,0.5)',
                  animation: 'pulse 2s infinite',
                }}
              >
                ⚡ Install Now — One Click!
              </button>
            )}

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: deferredPrompt ? '0.6rem' : '1.2rem',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px', padding: '0.7rem',
                fontWeight: '600', cursor: 'pointer', width: '100%', fontSize: '0.9rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}


