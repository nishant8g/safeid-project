/**
 * Register Page with Google Single Sign-On
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      // 1. credentialResponse.credential is the direct Google ID Token (JWT)
      const googleToken = credentialResponse.credential;

      // 2. Authenticate with SafeID API (Strict Registration)
      await register(googleToken);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || `Secure Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Absolute Ambient Background */}
      <div className="login-blobs-container">
        <div className="plasma-blob blob-1"></div>
        <div className="plasma-blob blob-2" style={{ background: 'var(--accent-emerald)', opacity: 0.3 }}></div>
        <div className="plasma-blob blob-3"></div>
      </div>

      <div className="login-card-wrapper">
        <div className="login-glass-card">

          <div className="animated-shield-container">
            <div className="shield-pulse"></div>
            🛡️
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join SafeID
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Create your military-grade emergency profile.<br />Verified instantly via Google.
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '2rem', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Registration Failed')}
              useOneTap
              theme="filled_blue"
              shape="pill"
              text="signup_with"
            />
          </div>

          <p style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}>Sign In</span>
          </p>

        </div>
      </div>
    </>
  );
}


