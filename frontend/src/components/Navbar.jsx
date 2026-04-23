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

// Smart Get App button — detects browser and shows the RIGHT instructions
function GetAppButton({ deferredPrompt, onInstall }) {
  const [showModal, setShowModal] = useState(false);

  // Detect iOS Safari
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIosSafari = isIos && isSafari;

  const handleClick = () => {
    if (deferredPrompt) {
      // Native Android/Desktop Chrome install — best experience
      onInstall();
    } else {
      setShowModal(true);
    }
  };

  const modalContent = isIosSafari ? <IosGuide onClose={() => setShowModal(false)} /> : <GenericGuide onClose={() => setShowModal(false)} />;

  return (
    <>
      <button
        onClick={handleClick}
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

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <div onClick={e => e.stopPropagation()}>
            {modalContent}
          </div>
        </div>
      )}
    </>
  );
}

// iOS Safari-specific guide with visual steps
function IosGuide({ onClose }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0e1628, #0d1f3c)',
      border: '1px solid rgba(0,242,255,0.2)', borderRadius: '24px',
      padding: '2rem', maxWidth: '360px', width: '90vw',
      boxShadow: '0 25px 80px rgba(0,0,0,0.7)', textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍎</div>
      <h3 style={{ color: '#fff', fontWeight: '900', margin: '0 0 0.4rem', fontSize: '1.3rem' }}>Add to Your iPhone</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
        Follow these 3 quick steps in Safari
      </p>

      {[
        { icon: '⬆️', label: 'Tap the Share icon', sub: 'at the bottom of your screen' },
        { icon: '➕', label: 'Tap "Add to Home Screen"', sub: 'scroll down in the share sheet' },
        { icon: '✅', label: 'Tap "Add"', sub: 'SafeID icon appears on your home screen' },
      ].map((step, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
          padding: '0.9rem 1rem', marginBottom: '0.6rem', textAlign: 'left',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0061ff44, #00f2ff44)',
            border: '1px solid rgba(0,242,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', flexShrink: 0,
          }}>{step.icon}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.92rem' }}>{step.label}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>{step.sub}</div>
          </div>
        </div>
      ))}

      <button onClick={onClose} style={{
        marginTop: '1.25rem', background: 'linear-gradient(135deg, #0061ff, #00f2ff)',
        color: '#fff', border: 'none', borderRadius: '12px',
        padding: '0.8rem', fontWeight: '800', cursor: 'pointer',
        width: '100%', fontSize: '0.95rem', letterSpacing: '0.03em',
      }}>Got it ✓</button>
    </div>
  );
}

// Android / Desktop guide
function GenericGuide({ onClose }) {
  const isAndroid = /android/i.test(navigator.userAgent);
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0e1628, #0d1f3c)',
      border: '1px solid rgba(0,242,255,0.2)', borderRadius: '24px',
      padding: '2rem', maxWidth: '360px', width: '90vw',
      boxShadow: '0 25px 80px rgba(0,0,0,0.7)', textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{isAndroid ? '🤖' : '🖥️'}</div>
      <h3 style={{ color: '#fff', fontWeight: '900', margin: '0 0 0.4rem', fontSize: '1.3rem' }}>
        {isAndroid ? 'Install on Android' : 'Install on Desktop'}
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
        {isAndroid ? 'Using Chrome on your Android device' : 'Using Chrome or Edge on your computer'}
      </p>

      {(isAndroid ? [
        { icon: '⋮', label: 'Tap the menu icon', sub: 'top-right corner of Chrome' },
        { icon: '📲', label: 'Tap "Add to Home Screen"', sub: 'or "Install App"' },
        { icon: '✅', label: 'Tap "Install"', sub: 'App icon appears on your home screen' },
      ] : [
        { icon: '⊕', label: 'Click the install icon', sub: 'in the right side of the address bar' },
        { icon: '✅', label: 'Click "Install"', sub: 'SafeID opens as a native desktop app' },
      ]).map((step, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
          padding: '0.9rem 1rem', marginBottom: '0.6rem', textAlign: 'left',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0061ff44, #00f2ff44)',
            border: '1px solid rgba(0,242,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0, fontWeight: '900', color: '#00f2ff',
          }}>{step.icon}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.92rem' }}>{step.label}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>{step.sub}</div>
          </div>
        </div>
      ))}

      <button onClick={onClose} style={{
        marginTop: '1.25rem', background: 'linear-gradient(135deg, #0061ff, #00f2ff)',
        color: '#fff', border: 'none', borderRadius: '12px',
        padding: '0.8rem', fontWeight: '800', cursor: 'pointer',
        width: '100%', fontSize: '0.95rem', letterSpacing: '0.03em',
      }}>Got it ✓</button>
    </div>
  );
}
