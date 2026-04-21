/**
 * Register Page with Google Single Sign-On
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Absolute Ambient Background matching Landing page */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(0, 97, 255, 0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(157, 80, 187, 0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0 }} />

      <div style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '32px', padding: '60px 40px', border: '1px solid rgba(255, 255, 255, 1)', boxShadow: '0 40px 80px rgba(67, 56, 202, 0.15), 0 0 0 8px rgba(255, 255, 255, 0.4)', width: '100%', maxWidth: '420px', textAlign: 'center' }}
        >

          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <ShieldCheck size={40} color="#10b981" strokeWidth={2.5} />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Join SafeID
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.5', margin: 0 }}>
              Create your military-grade emergency profile.<br />Verified instantly via Google.
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
              onError={() => setError('Google Registration Failed')}
              useOneTap
              theme="outline"
              shape="pill"
              text="signup_with"
            />
          </div>

          <p style={{ marginTop: '40px', fontSize: '0.9rem', color: '#64748b' }}>
            Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#0061FF', cursor: 'pointer', fontWeight: '700' }}>Sign In</span>
          </p>

        </motion.div>
      </div>
    </div>
  );
}


