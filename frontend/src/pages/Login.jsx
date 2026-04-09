/**
 * Login Page with Google Single Sign-On
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      // 1. credentialResponse.credential is the direct Google ID Token (JWT)
      const googleToken = credentialResponse.credential;

      // 2. Authenticate with SafeID API
      await login(googleToken);
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || `Secure Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Absolute Ambient Background */}
      <div className="login-blobs-container">
        <div className="plasma-blob blob-1"></div>
        <div className="plasma-blob blob-2"></div>
        <div className="plasma-blob blob-3"></div>
      </div>

      {/* Foreground Content */}
      <div className="login-card-wrapper">
        <div className="login-glass-card">
          
          <div className="animated-shield-container">
            <div className="shield-pulse"></div>
            🛡️
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SafeID
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Military-grade digital identity.<br/>One-tap emergency response.
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '2.0rem', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Authentication Failed')}
              useOneTap
              theme="filled_blue"
              shape="pill"
            />
          </div>
          
          <p style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            New to SafeID? <span onClick={() => navigate('/')} style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}>Create an identity</span>
            <br/><br/>
            By continuing, you prove your identity via Google Authentication.
          </p>

        </div>
      </div>
    </>
  );
}

