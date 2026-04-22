/**
 * Profile Page — Edit medical information.
 */
import { useState, useEffect } from 'react';
import { userAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ABHACard from '../components/ABHACard';
import { Shield } from 'lucide-react';

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
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
              <div style={{ padding: '6px', background: 'var(--accent-cyan)', borderRadius: '6px' }}>
                <Shield size={18} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>ABHA Health ID Sync</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--accent-cyan)' }}>Official Health ID Number</label>
                <input
                  type="text"
                  name="abha_id"
                  className="form-input"
                  placeholder="XX-XXXX-XXXX-XXXX"
                  value={formData.abha_id || ''}
                  onChange={handleChange}
                  id="medical-abha-id"
                  style={{ 
                    border: '1.5px solid rgba(34, 211, 238, 0.3)', 
                    fontSize: '1.2rem', 
                    letterSpacing: '0.1em',
                    fontWeight: '800',
                    color: 'var(--accent-cyan)'
                  }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  Syncing your ABHA ID allows first responders to access your verified Indian national health records instantly.
                </p>
              </div>

              <div className="abha-preview" style={{ opacity: formData.abha_id ? 1 : 0.6, filter: formData.abha_id ? 'none' : 'grayscale(0.5)', transition: 'all 0.3s ease' }}>
                <ABHACard 
                  abhaId={formData.abha_id} 
                  fullName={user?.full_name} 
                  dob={formData.date_of_birth}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving} id="save-medical" style={{ padding: '1rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700' }}>
            {saving ? 'Saving...' : '💾 Save Medical Information'}
          </button>
        </form>
      </div>
    </div>
  );
}
