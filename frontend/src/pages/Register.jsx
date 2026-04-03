/**
 * Register Page with Firebase Email Verification
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Trigger the Firebase Verification Email
      await sendEmailVerification(user);

      // 3. Optional: Store their full profile in our backend so it's ready when they log in
      // We pass a dummy firebaseToken since they aren't verified yet, or just rely on backend ignoring token for pre-registration
      await register(formData.full_name, formData.email, formData.phone, formData.password, "unverified_registration");
      
      // 4. Freeze screen to instruct user
      setEmailSent(true);

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login.');
      } else {
        setError(`Registration failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="page-container narrow animate-fade-in" style={{ paddingTop: '2rem' }}>
        <div className="glass-card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
          <h2 style={{ color: 'var(--accent-blue)' }}>Check Your Inbox!</h2>
          <p className="text-muted" style={{ marginTop: '1rem', marginBottom: '2rem', fontSize: '1.1rem' }}>
            To keep out fake accounts, we just sent a secure activation link to <strong>{formData.email}</strong>.
          </p>
          <div className="alert alert-warning" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            ⚠️ You cannot access your SafeID dashboard until you click the link in that email. Check your Spam folder if you don't see it!
          </div>
          <Link to="/login" className="btn btn-primary btn-lg btn-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container narrow animate-fade-in" style={{ paddingTop: '2rem' }}>
      <div className="glass-card">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
          <h2>Create Your SafeID</h2>
          <p className="text-muted">Your digital lifeline starts here</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="full_name" className="form-input" placeholder="Nishant Kumar" value={formData.full_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional Profile Detail)</label>
            <input type="tel" name="phone" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />
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
            {loading ? 'Securing Account...' : '🚀 Create SafeID'}
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

