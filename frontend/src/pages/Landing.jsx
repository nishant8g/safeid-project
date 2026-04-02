/**
 * Landing Page — Premium hero section with features.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="section-tag" style={{ marginBottom: '1.5rem' }}>
          🛡️ AI-Powered Emergency Response
        </div>
        <h1 className="hero-title">
          Your Life-Saving<br />
          <span className="gradient-text">Digital Identity</span>
        </h1>
        <p className="hero-subtitle">
          SafeID creates an instant digital lifeline. One QR scan connects bystanders to your
          medical info and emergency contacts — no app needed, works in seconds.
        </p>
        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              📊 Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                🚀 Create Your SafeID — Free
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                Sign In →
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ maxWidth: '700px', margin: '3rem auto 0' }}>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">&lt; 3s</div>
            <div className="stat-label">Response Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Privacy Safe</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📡</div>
            <div className="stat-value">SMS</div>
            <div className="stat-label">Fallback Ready</div>
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
