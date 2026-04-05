/**
 * Register Page with Google Single Sign-On
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
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

      // 3. Authenticate with SafeID API (Strict Registration)
      await register(firebaseToken);
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.response?.data?.detail || `Secure Registration failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

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
            <div className="shield-pulse" style={{ borderColor: 'var(--accent-emerald)' }}></div>
            ✨
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #10b981, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join SafeID
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Create your military-grade emergency profile.<br/>Verified instantly via Google.
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '2rem', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)' }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn} 
            className="btn-google-premium" 
            disabled={loading}
            style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="22" height="22" alt="Google" style={{ background: 'white', borderRadius: '50%', padding: '2px' }} />
            {loading ? 'Creating Identity...' : 'Register with Google'}
          </button>
          
          <p style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}>Sign In</span>
          </p>

        </div>
      </div>
    </>
}

