/**
 * Login Page with Google Single Sign-On
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

      // 2. Authenticate with ResQ API
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Foreground Content */}

      {/* Foreground Content */}
      <div style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(30px)', borderRadius: '32px', padding: '60px 40px', border: '1px solid var(--border-subtle)', boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '420px', textAlign: 'center' }}
        >
          
          <Link 
            to="/" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem', marginBottom: '24px', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', alignSelf: 'flex-start', transition: 'all 0.2s ease', border: '1px solid var(--border-subtle)' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.background = 'rgba(0, 242, 255, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div style={{ width: '80px', height: '80px', background: 'rgba(0, 242, 255, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
            <ShieldCheck size={40} color="var(--accent-cyan)" strokeWidth={2.5} />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
              Military-grade digital identity.<br/>One-tap emergency response.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: '32px', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '16px', borderRadius: '16px', color: '#b91c1c' }}>
              <span><b style={{marginRight:'8px'}}>⚠️</b> {error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Authentication Failed')}
              useOneTap
              theme="outline"
              shape="pill"
            />
          </div>
          
          <p style={{ marginTop: '40px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            New to ResQ? <span onClick={() => navigate('/register')} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '700' }}>Create an identity</span>
            <br/><br/>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>By continuing, you prove your identity via Google Authentication.</span>
          </p>

        </motion.div>
      </div>
    </div>
  );
}

