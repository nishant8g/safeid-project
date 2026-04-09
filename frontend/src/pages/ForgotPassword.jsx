/**
 * This page is deprecated as the project has migrated to Google OAuth2.
 * Password resets are now managed directly through Google.
 */
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="page-container narrow animate-fade-in" style={{ paddingTop: '5rem', textAlign: 'center' }}>
      <div className="glass-card">
        <h1>🔐 Account Security</h1>
        <p className="text-muted" style={{ margin: '1.5rem 0' }}>
          SafeID now uses <strong>Google Authentication</strong> for your security. 
          If you need to reset your password, please do so via your Google Account settings.
        </p>
        <Link to="/login" className="btn btn-primary btn-full">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
