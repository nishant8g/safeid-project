/**
 * Login Page with Firebase Email Auth
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedUser(null);
    setLoading(true);
    try {
      // 1. Authenticate with Firebase Email
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check if they verified their email inbox
      if (!user.emailVerified) {
        setUnverifiedUser(user);
        throw new Error('email_not_verified');
      }

      // 3. Extract the un-forgeable JWT token to prove it to our backend
      const firebaseToken = await user.getIdToken();

      // 4. Send token to backend to establish the master session
      await login(email, password, firebaseToken);
      
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'email_not_verified') {
        setError('Please check your email inbox and click the verification link to activate your account.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(`Login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!unverifiedUser) return;
    try {
      await sendEmailVerification(unverifiedUser);
      alert("A new verification link has been sent to your email!");
    } catch(err) {
      alert("Please wait a few minutes before requesting another link.");
    }
  };

  return (
    <div className="page-container narrow animate-fade-in" style={{ paddingTop: '3rem' }}>
      <div className="glass-card">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to your SafeID account</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            ⚠️ {error}
            {unverifiedUser && (
              <button 
                type="button" 
                onClick={handleResendLink} 
                className="btn btn-ghost"
                style={{ display: 'block', marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                Resend Verification Link
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="login-submit">
            {loading ? 'Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
            Create SafeID
          </Link>
        </p>
      </div>
    </div>
  );
}
