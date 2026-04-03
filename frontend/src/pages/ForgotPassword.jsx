/**
 * Forgot Password Page
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('A password reset link has been sent to your email! Please check your inbox (and spam folder) to reset your password.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(`Failed to send reset email: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container narrow animate-fade-in" style={{ paddingTop: '3rem' }}>
      <div className="glass-card">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔑</div>
          <h2>Reset Password</h2>
          <p className="text-muted">Enter your email to regain access</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem', backgroundColor: 'rgba(46, 213, 115, 0.1)', color: 'var(--accent-green)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(46, 213, 115, 0.2)' }}>✅ {success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Sending Link...' : '📨 Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Remembered your password?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
