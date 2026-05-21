/**
 * Profile Page — Edit medical information.
 */
import { useState, useEffect } from 'react';
import { userAPI, abhaAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ABHACard from '../components/ABHACard';
import { Shield, CheckCircle2 } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    blood_group: '',
    allergies: '',
    conditions: '',
    medications: '',
    organ_donor: false,
    special_notes: '',
    date_of_birth: '',
    height: '',
    weight: '',
    abha_id: '',
    abha_verified: false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // ABHA Sync States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [txnId, setTxnId] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [abhaGender, setAbhaGender] = useState('');

  useEffect(() => {
    loadMedical();
  }, []);

  const loadMedical = async () => {
    try {
      const res = await userAPI.getMedical();
      setFormData(res.data);
    } catch {
      // No medical info yet — that's okay
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAbhaInit = async (e) => {
    e.preventDefault();
    if (!formData.abha_id) {
      setError('Please enter a valid ABHA ID first.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await abhaAPI.verifyInit({ abha_id: formData.abha_id });
      if (res.data.status === 'success') {
        setTxnId(res.data.txn_id);
        setOtpMessage(res.data.message);
        setShowOtpModal(true);
        setOtpCode('');
        setOtpError('');
      } else {
        setError(res.data.message || 'Failed to initialize ABHA sync');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initialize ABHA sync. Check format.');
    } finally {
      setSaving(false);
    }
  };

  const handleAbhaConfirm = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit OTP code.');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await abhaAPI.verifyConfirm({
        txn_id: txnId,
        otp: otpCode,
        abha_id: formData.abha_id
      });
      if (res.data.status === 'success') {
        const { profile } = res.data;
        setFormData(prev => ({
          ...prev,
          abha_verified: true,
          abha_id: profile.abha_id,
          blood_group: profile.blood_group || prev.blood_group,
          date_of_birth: profile.dob || prev.date_of_birth,
          conditions: prev.conditions || 'None (ABDM Verified)',
          allergies: prev.allergies || 'None (ABDM Verified)'
        }));
        setAbhaGender(profile.gender || '');
        setShowOtpModal(false);
        setSuccess('ABHA Health Account successfully linked and verified!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setOtpError(res.data.message || 'Verification failed');
      }
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Invalid verification code. Use 123456.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await userAPI.saveMedical(formData);
      setSuccess('Medical information saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container medium animate-fade-in">
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag" style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-cyan)', fontWeight: '700' }}>Medical Profile</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>🩺 Medical Information</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>This info will be shown to rescuers who scan your QR code.</p>
      </div>

      {success && <div className="alert alert-success" style={{ background: 'rgba(0, 255, 170, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(0, 255, 170, 0.2)', borderRadius: '12px' }}>✅ {success}</div>}
      {error && <div className="alert alert-error" style={{ background: 'rgba(255, 51, 102, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(255, 51, 102, 0.2)', borderRadius: '12px' }}>⚠️ {error}</div>}

      <div className="glass-card" style={{ border: '1.5px solid var(--border-subtle)', padding: '40px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                name="blood_group"
                className="form-select"
                value={formData.blood_group || ''}
                onChange={handleChange}
                id="medical-blood-group"
                disabled={formData.abha_verified}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                className="form-input"
                value={formData.date_of_birth || ''}
                onChange={handleChange}
                id="medical-dob"
                disabled={formData.abha_verified}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Allergies</label>
            <textarea
              name="allergies"
              className="form-textarea"
              placeholder="e.g., Penicillin, Peanuts, Latex (separate with commas)"
              value={formData.allergies || ''}
              onChange={handleChange}
              id="medical-allergies"
              style={{ minHeight: '80px' }}
              disabled={formData.abha_verified}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Medical Conditions</label>
            <textarea
              name="conditions"
              className="form-textarea"
              placeholder="e.g., Diabetes Type 2, Asthma, Epilepsy"
              value={formData.conditions || ''}
              onChange={handleChange}
              id="medical-conditions"
              style={{ minHeight: '80px' }}
              disabled={formData.abha_verified}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Medications</label>
            <textarea
              name="medications"
              className="form-textarea"
              placeholder="e.g., Metformin 500mg, Insulin, Ventolin inhaler"
              value={formData.medications || ''}
              onChange={handleChange}
              id="medical-medications"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Height</label>
              <input
                type="text"
                name="height"
                className="form-input"
                placeholder="e.g., 178 cm or 5 ft 10 in"
                value={formData.height || ''}
                onChange={handleChange}
                id="medical-height"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight</label>
              <input
                type="text"
                name="weight"
                className="form-input"
                placeholder="e.g., 70 kg or 154 lbs"
                value={formData.weight || ''}
                onChange={handleChange}
                id="medical-weight"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Notes</label>
            <textarea
              name="special_notes"
              className="form-textarea"
              placeholder="Any additional information rescuers should know"
              value={formData.special_notes || ''}
              onChange={handleChange}
              id="medical-notes"
            />
          </div>

          <div className="form-group">
            <label style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              cursor: 'pointer', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px', border: '1px solid var(--border-subtle)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            >
              <input
                type="checkbox"
                name="organ_donor"
                checked={formData.organ_donor || false}
                onChange={handleChange}
                style={{ width: '22px', height: '22px', accentColor: 'var(--accent-emerald)' }}
                id="medical-organ-donor"
              />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Organ Donor</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  I wish to be an organ donor
                </div>
              </div>
            </label>
          </div>

          <div className="section-divider" style={{ 
            height: '1px', 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            margin: '2rem 0'
          }}></div>

          <div className="abha-sync-section" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '6px', background: formData.abha_verified ? 'var(--accent-emerald)' : 'var(--accent-cyan)', borderRadius: '6px', transition: 'all 0.3s ease' }}>
                <Shield size={18} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>ABHA Health ID Sync</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: formData.abha_verified ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>
                  Official Health ID Number
                </label>
                <input
                  type="text"
                  name="abha_id"
                  className="form-input"
                  placeholder="XX-XXXX-XXXX-XXXX"
                  value={formData.abha_id || ''}
                  onChange={handleChange}
                  id="medical-abha-id"
                  disabled={formData.abha_verified}
                  style={{ 
                    border: formData.abha_verified ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1.5px solid rgba(34, 211, 238, 0.3)', 
                    fontSize: '1.2rem', 
                    letterSpacing: '0.1em',
                    fontWeight: '800',
                    color: formData.abha_verified ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                    background: formData.abha_verified ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  Syncing your ABHA ID allows first responders to access your verified Indian national health records instantly.
                </p>

                {!formData.abha_verified && formData.abha_id && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAbhaInit}
                    style={{
                      marginTop: '1rem',
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '12px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #06b6d4 100%)',
                      boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)'
                    }}
                  >
                    🔗 Verify & Link Health ID
                  </button>
                )}

                {formData.abha_verified && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--accent-emerald)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>🛡️ ABDM Secured & Synced</span>
                  </div>
                )}
              </div>

              <div className="abha-preview" style={{ transition: 'all 0.3s ease' }}>
                <ABHACard 
                  abhaId={formData.abha_id} 
                  fullName={user?.full_name} 
                  dob={formData.date_of_birth}
                  gender={abhaGender}
                  verified={formData.abha_verified}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving} id="save-medical" style={{ padding: '1rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700' }}>
            {saving ? 'Saving...' : '💾 Save Medical Information'}
          </button>
        </form>
      </div>

      {showOtpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{
            width: '90%',
            maxWidth: '450px',
            padding: '2.5rem',
            border: '1.5px solid rgba(34, 211, 238, 0.4)',
            boxShadow: '0 0 40px rgba(34, 211, 238, 0.25), 0 20px 40px rgba(0,0,0,0.6)',
            borderRadius: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              background: 'rgba(34, 211, 238, 0.1)',
              borderRadius: '50%',
              marginBottom: '1.5rem',
              border: '1px solid rgba(34, 211, 238, 0.3)'
            }}>
              <Shield size={32} color="var(--accent-cyan)" />
            </div>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>ABHA OTP Verification</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {otpMessage || 'We have sent a verification code to your registered mobile number.'}
            </p>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="0 0 0 0 0 0"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '2rem',
                  fontWeight: '800',
                  letterSpacing: '0.2em',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: '16px',
                  padding: '0.75rem',
                  color: 'var(--accent-cyan)'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.5rem', opacity: 0.8 }}>
                💡 Tip: Enter the test code: <strong>123456</strong>
              </p>
            </div>

            {otpError && (
              <div style={{
                color: 'var(--accent-red)',
                background: 'rgba(255, 51, 102, 0.1)',
                border: '1px solid rgba(255, 51, 102, 0.2)',
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                fontWeight: '600'
              }}>
                ⚠️ {otpError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowOtpModal(false)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', fontWeight: '700' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={verifyingOtp}
                onClick={handleAbhaConfirm}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', fontWeight: '700' }}
              >
                {verifyingOtp ? 'Verifying...' : 'Verify & Sync'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
