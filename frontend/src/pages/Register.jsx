/**
 * Register Page with Firebase Phone Auth
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function Register() {
  const [step, setStep] = useState(1); // 1 = Details, 2 = Verify OTP
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize invisible recaptcha for Firebase SMS
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestSMS = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.phone.startsWith('+')) {
      setError('Please include your country code (e.g. +91) in the phone number.');
      return;
    }

    setLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, formData.phone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(`Failed to send SMS: ${err.message}. Please check your phone number format.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Verify the 6-digit code with Google
      const result = await confirmationResult.confirm(formData.otp);
      
      // 2. Extract the un-forgeable JWT token to prove it to our backend
      const firebaseToken = await result.user.getIdToken();
      
      // 3. Complete the registration on our backend
      await register(formData.full_name, formData.email, formData.phone, formData.password, firebaseToken);
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container narrow animate-fade-in" style={{ paddingTop: '2rem' }}>
      <div className="glass-card">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
          <h2>Create Your SafeID</h2>
          <p className="text-muted">Your digital lifeline starts here</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Firebase Required Container */}
        <div id="recaptcha-container"></div>

        {step === 1 ? (
          <form onSubmit={handleRequestSMS}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="full_name" className="form-input" placeholder="Nishant Kumar" value={formData.full_name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Required for Security)</label>
              <input type="tel" name="phone" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />
              <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>Include country code (+91). An SMS verification code will be sent.</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required minLength={6} />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-input" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Sending SMS...' : '📱 Verify Phone Number'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="animate-fade-in text-center">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-blue)' }}>Verify Your Phone</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              We sent a 6-digit verification code to <strong>{formData.phone}</strong>.
            </p>
            
            <div className="form-group">
              <input 
                type="text" 
                name="otp" 
                className="form-input text-center" 
                placeholder="000000" 
                value={formData.otp} 
                onChange={handleChange} 
                required 
                maxLength={6}
                style={{ fontSize: '2rem', letterSpacing: '0.25rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Verifying & Creating Account...' : '✅ Confirm & Register'}
            </button>
            <button type="button" className="btn btn-ghost btn-full" style={{ marginTop: '0.5rem' }} onClick={() => setStep(1)} disabled={loading}>
              ← Go Back
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

