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
      <div className="section-header">
        <div className="section-tag">Medical Profile</div>
        <h2>🩺 Medical Information</h2>
        <p>This info will be shown to rescuers who scan your QR code.</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="glass-card">
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
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              cursor: 'pointer', padding: '0.75rem', background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
            }}>
              <input
                type="checkbox"
                name="organ_donor"
                checked={formData.organ_donor || false}
                onChange={handleChange}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-emerald)' }}
                id="medical-organ-donor"
              />
              <div>
                <div style={{ fontWeight: 600 }}>Organ Donor</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  I wish to be an organ donor
                </div>
              </div>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving} id="save-medical">
            {saving ? 'Saving...' : '💾 Save Medical Information'}
          </button>
        </form>
      </div>
    </div>
  );
}
