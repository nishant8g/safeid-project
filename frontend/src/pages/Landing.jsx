/**
 * Landing Page — Premium hero section with features.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Absolute Ambient Background for Hero */}
      <div className="login-blobs-container" style={{ position: 'absolute', height: '100vh', top: 0, zIndex: -1 }}>
        <div className="plasma-blob blob-1"></div>
        <div className="plasma-blob blob-2"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
        <div className="section-tag" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          🛡️ AI-Powered Emergency Response
        </div>
        <h1 className="hero-title" style={{ fontSize: '4.5rem', lineHeight: '1.1', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          Your Life-Saving<br />
          <span style={{ background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Identity</span>
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '1.5rem auto 2.5rem auto', color: '#94a3b8' }}>
          SafeID creates an instant digital lifeline. One QR scan connects bystanders to your
          medical info and emergency contacts — no app needed, works in seconds.
        </p>
        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-glass-white">
              📊 Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-glass-white">
                🚀 Create Your SafeID
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg" style={{ color: 'white' }}>
                Sign In →
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ maxWidth: '800px', margin: '4rem auto 0', gap: '2rem' }}>
          <div className="stat-card" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: '24px', padding: '2rem' }}>
            <div className="stat-icon" style={{ background: 'transparent' }}>⚡</div>
            <div className="stat-value" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>&lt; 3s</div>
            <div className="stat-label" style={{ color: '#94a3b8' }}>Response Time</div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: '24px', padding: '2rem' }}>
            <div className="stat-icon" style={{ background: 'transparent' }}>🔒</div>
            <div className="stat-value" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>100%</div>
            <div className="stat-label" style={{ color: '#94a3b8' }}>Privacy Safe</div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: '24px', padding: '2rem' }}>
            <div className="stat-icon" style={{ background: 'transparent' }}>📡</div>
            <div className="stat-value" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>SMS</div>
            <div className="stat-label" style={{ color: '#94a3b8' }}>Fallback Ready</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="page-container" style={{ paddingTop: 0 }}>
        <div className="section-header text-center">
          <div className="section-tag">How It Works</div>
          <h2>Three Steps to Safety</h2>
          <p>Simple for you. Zero friction for the rescuer.</p>
        </div>

        <div className="features-grid stagger-children">
          <div className="feature-card">
            <div className="feature-icon red">📝</div>
            <h3>1. Create Your Profile</h3>
            <p>Add your medical details — blood group, allergies, conditions, emergency contacts. Takes 2 minutes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">📱</div>
            <h3>2. Get Your QR Code</h3>
            <p>We generate a unique QR code. Print it, stick it on your phone, wallet, or helmet. Always accessible.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">🚨</div>
            <h3>3. Instant Emergency Help</h3>
            <p>Bystander scans → sees your info → taps "Notify Family" → GPS + SMS sent instantly. No app needed.</p>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="page-container">
        <div className="section-header text-center">
          <div className="section-tag">AI-Powered Features</div>
          <h2>Intelligent Emergency Response</h2>
          <p>Advanced AI makes every second count.</p>
        </div>

        <div className="features-grid stagger-children">
          <div className="feature-card">
            <div className="feature-icon purple">🧠</div>
            <h3>Smart SOS Messages</h3>
            <p>AI generates clear, context-aware emergency messages with medical info and location for your contacts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon amber">📊</div>
            <h3>Severity Estimation</h3>
            <p>AI analyzes the situation to classify urgency as Minor, Moderate, or Critical — helping family understand.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon cyan">🎤</div>
            <h3>Voice Commands</h3>
            <p>Rescuer says "Send Help" hands-free. Speech recognition triggers the alert automatically.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon red">⚕️</div>
            <h3>Risk Prediction</h3>
            <p>Based on your medical data, AI suggests personalized health warnings and recommendations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">📍</div>
            <h3>GPS + Maps</h3>
            <p>Automatic location capture with Google Maps link sent to contacts. Know exactly where help is needed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">💬</div>
            <h3>SMS + WhatsApp</h3>
            <p>Alerts sent via SMS and WhatsApp simultaneously. Multiple channels ensure the message gets through.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="page-container text-center" style={{ paddingBottom: '4rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Ready to protect yourself?</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Create your SafeID in under 2 minutes. It's free.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            🛡️ Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
