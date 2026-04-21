/**
 * Profile Page — Edit medical information.
 */
import { useState, useEffect } from 'react';
import { userAPI } from '../api/client';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile() {
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
        <div className="section-tag" style={{ background: 'rgba(0, 97, 255, 0.1)', color: '#0061FF', fontWeight: '700' }}>Medical Profile</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>🩺 Medical Information</h2>
        <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: '500' }}>This info will be shown to rescuers who scan your QR code.</p>
      </div>

      {success && <div className="alert alert-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#065f46', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>✅ {success}</div>}
      {error && <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#991b1b', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>⚠️ {error}</div>}

      <div className="glass-card" style={{ border: '1px solid rgba(255, 255, 255, 1)', padding: '40px' }}>
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
              cursor: 'pointer', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 1)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
            >
              <input
                type="checkbox"
                name="organ_donor"
                checked={formData.organ_donor || false}
                onChange={handleChange}
                style={{ width: '22px', height: '22px', accentColor: '#10b981' }}
                id="medical-organ-donor"
              />
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>Organ Donor</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                  I wish to be an organ donor
                </div>
              </div>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving} id="save-medical" style={{ padding: '1rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700' }}>
            {saving ? 'Saving...' : '💾 Save Medical Information'}
          </button>
        </form>
      </div>
    </div>
  );
}
