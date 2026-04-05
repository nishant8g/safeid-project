/**
 * Login Page with Google Single Sign-On
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // 1. Authenticate intensely securely via Google Popup
      const userCredential = await signInWithPopup(auth, provider);
      
      // 2. Extract mathematical JWT to prove identity to the backend
      const firebaseToken = await userCredential.user.getIdToken();

      // 3. Authenticate with SafeID API
      await login(firebaseToken);
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.response?.data?.detail || `Secure Login failed: ${err.message}`);
      }
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
              {error.toLowerCase().includes('sign up') && (
                <button 
                  onClick={() => navigate('/register')}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    color: 'white', 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    fontSize: '0.9rem', 
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  Create New Account →
                </button>
              )}
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn} 
            className="btn-google-premium" 
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="22" height="22" alt="Google" style={{ background: 'white', borderRadius: '50%', padding: '2px' }} />
            {loading ? 'Authenticating...' : 'Continue with Google'}
          </button>
          
          <p style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            New to SafeID? <span onClick={() => navigate('/register')} style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}>Create an identity</span>
            <br/><br/>
            By continuing, you prove your identity via Google Authentication.
          </p>

        </div>
      </div>
    </>
  );
}
