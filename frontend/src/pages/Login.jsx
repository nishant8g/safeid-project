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
    <div className="page-container narrow animate-fade-in" style={{ paddingTop: '5rem' }}>
      <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
          <h2>Welcome to SafeID</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Military-grade security. 1-Click Login.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            ⚠️ {error}
          </div>
        )}

        <button 
          onClick={handleGoogleSignIn} 
          className="btn btn-primary btn-full btn-lg" 
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid #d1d5db',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            fontSize: '1.1rem',
            padding: '1rem',
            transition: 'all 0.3s ease'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="24" height="24" alt="Google Logo" />
          {loading ? 'Authenticating...' : 'Continue with Google'}
        </button>
        
        <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          By continuing, you are proving your identity securely via Google Authentication.
        </p>
      </div>
    </div>
  );
}
