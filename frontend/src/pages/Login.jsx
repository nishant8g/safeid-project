/**
 * Login Page
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
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

        {error && <div className="alert alert-error">⚠️ {error}</div>}

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
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
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
