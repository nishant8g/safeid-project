/**
 * This page is deprecated as the project has migrated to Google OAuth2.
 * Password resets are now managed directly through Google.
 */
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="page-container narrow animate-fade-in" style={{ paddingTop: '5rem', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(255, 255, 255, 1)', borderRadius: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>🔐 Account Security</h1>
        <p style={{ margin: '1.5rem 0', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
          SafeID now uses <strong>Google Authentication</strong> for your security. 
          If you need to reset your password, please do so via your Google Account settings.
        </p>
        <Link to="/login" className="btn btn-primary btn-full" style={{ padding: '1rem', borderRadius: '14px', fontWeight: '700' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
