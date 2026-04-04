/**
 * Landing Page — High Fidelity Premium Landing Page
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '6rem' }}>
      
      {/* Absolute Ambient Background for Hero */}
      <div className="login-blobs-container">
        <div className="plasma-blob blob-1"></div>
        <div className="plasma-blob blob-2"></div>
        <div className="plasma-blob blob-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
        <h1 className="hero-title" style={{ fontSize: '5.5rem', fontWeight: '800', lineHeight: '1', marginBottom: '2rem', letterSpacing: '-0.04em', textShadow: '0 0 40px rgba(255,255,255,0.4)' }}>
          Your Life-Saving<br />
          Digital Identity
        </h1>
        
        {/* Main CTA */}
        <div className="hero-actions" style={{ marginBottom: '5rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-cyan-pill">
              Go to Dashboard ↗
            </Link>
          ) : (
            <Link to="/register" className="btn-cyan-pill">
              Create Your SafeID ↗
            </Link>
          )}
        </div>

        {/* Glowing Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1100px', padding: '0 1.5rem' }}>
          
          <div className="glow-card glow-card-blue">
            <div className="card-icon-box" style={{ color: '#60a5fa' }}>
              🏥
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.8rem', fontWeight: '700' }}>Emergency Access</h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Instant access to vital medical info & contacts worldwide.
            </p>
          </div>

          <div className="glow-card glow-card-cyan">
            <div className="card-icon-box" style={{ color: '#2dd4bf' }}>
              🔑
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.8rem', fontWeight: '700' }}>Secure Verification</h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Biometric authentication ensures your identity is protected.
            </p>
          </div>

          <div className="glow-card glow-card-magenta">
            <div className="card-icon-box" style={{ color: '#d946ef' }}>
              ☁️
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.8rem', fontWeight: '700' }}>Digital Health Record</h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Encrypted storage for medical history, allergies, and documents.
            </p>
          </div>

        </div>
      </section>

      {/* Footer Area Matching Image */}
      <footer style={{ marginTop: 'auto', paddingTop: '8rem', paddingBottom: '2rem', width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ color: '#cbd5e1' }}>SafeID</strong> Copyright 2024
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Links</span>
          <span>Security</span>
          <span>Support</span>
          <span>Pricing</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '1.2rem', color: '#94a3b8' }}>
          <span>🐙</span> {/* GitHub placeholder */}
          <span>𝕏</span>  {/* X placeholder */}
          <span>📷</span> {/* IG placeholder */}
        </div>
      </footer>
    </div>
  );
}
