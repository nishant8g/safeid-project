/**
 * Landing Page — High Fidelity Premium Landing Page
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="animate-fade-in landing-container">
      
      {/* Absolute Ambient Background for Hero */}
      <div className="login-blobs-container">
        <div className="plasma-blob blob-1"></div>
        <div className="plasma-blob blob-2"></div>
        <div className="plasma-blob blob-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section landing-hero" style={{ zIndex: 1, position: 'relative' }}>
        <h1 className="hero-title landing-title">
          Your Life-Saving<br />
          Digital Identity
        </h1>
        
        {/* Main CTA */}
        <div className="hero-actions landing-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-cyan-pill">
              Go to Dashboard ↗
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-nav-outline" style={{ padding: '0.8rem 2rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Sign Up ↗
              </Link>
              <Link to="/login" className="btn-nav-outline" style={{ padding: '0.8rem 2rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Glowing Feature Cards */}
        <div className="landing-features-grid">
          
          <div className="glow-card glow-card-blue">
            <div className="card-icon-box" style={{ color: '#60a5fa' }}>🏥</div>
            <h3 className="feature-card-title">Emergency Access</h3>
            <p className="feature-card-desc">
              Instant access to vital medical info & contacts worldwide.
            </p>
          </div>

          <div className="glow-card glow-card-cyan">
            <div className="card-icon-box" style={{ color: '#2dd4bf' }}>🔑</div>
            <h3 className="feature-card-title">Secure Verification</h3>
            <p className="feature-card-desc">
              Biometric authentication ensures your identity is protected.
            </p>
          </div>

          <div className="glow-card glow-card-magenta">
            <div className="card-icon-box" style={{ color: '#d946ef' }}>☁️</div>
            <h3 className="feature-card-title">Digital Health Record</h3>
            <p className="feature-card-desc">
              Encrypted storage for medical history, allergies, and documents.
            </p>
          </div>

        </div>
      </section>

      {/* Footer Area Matching Image */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <strong>SafeID</strong> Copyright 2024
        </div>
        <div className="footer-links">
          <span>Links</span>
          <span>Security</span>
          <span>Support</span>
          <span>Pricing</span>
        </div>
        <div className="footer-social">
          <span>🐙</span> {/* GitHub placeholder */}
          <span>𝕏</span>  {/* X placeholder */}
          <span>📷</span> {/* IG placeholder */}
        </div>
      </footer>
    </div>
  );
}

