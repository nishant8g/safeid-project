/**
 * Contacts Page — Manage emergency contacts.
 */
import { useState, useEffect } from 'react';
import { userAPI } from '../api/client';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', relationship: '', priority: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await userAPI.getContacts();
      setContacts(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userAPI.addContact(formData);
      setFormData({ name: '', phone: '', relationship: '', priority: contacts.length + 1 });
      setShowForm(false);
      loadContacts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this emergency contact?')) return;
    try {
      await userAPI.deleteContact(id);
      loadContacts();
    } catch (err) {
      setError('Failed to delete contact');
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
        <div className="section-tag">Emergency Contacts</div>
        <h2>👥 Emergency Contacts</h2>
        <p>These people will be notified via SMS and WhatsApp when your QR code is scanned in an emergency.</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Contact List */}
      <div className="flex flex-col" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-card">
            <div className="contact-info">
              <div className="contact-avatar">{contact.name[0]}</div>
              <div className="contact-details">
                <h4>{contact.name}</h4>
                <p>{contact.relationship || 'Emergency Contact'} · {contact.phone}</p>
              </div>
            </div>
            <div className="contact-actions">
              <span className="badge badge-blue" style={{ fontSize: '0.7rem', marginRight: '0.25rem' }}>
                Priority #{contact.priority}
              </span>
              <button className="icon-btn danger" onClick={() => handleDelete(contact.id)} title="Remove">
                🗑️
              </button>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="glass-card text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3>No Emergency Contacts Yet</h3>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              Add people who should be notified in case of emergency.
            </p>
          </div>
        )}
      </div>

      {/* Add Contact Form */}
      {showForm ? (
        <div className="glass-card animate-slide-up">
          <h3 style={{ marginBottom: '1rem' }}>➕ Add Emergency Contact</h3>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contact name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  id="contact-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  id="contact-phone"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select
                  className="form-select"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  id="contact-relationship"
                >
                  <option value="">Select</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  id="contact-priority"
                >
                  {[1, 2, 3, 4, 5].map((p) => (
                    <option key={p} value={p}>Priority {p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex" style={{ gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} id="save-contact">
                {saving ? 'Adding...' : '✅ Add Contact'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        contacts.length < 5 && (
          <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowForm(true)} id="add-contact-btn">
            ➕ Add Emergency Contact
          </button>
        )
      )}

      {contacts.length >= 5 && (
        <div className="alert alert-info">ℹ️ Maximum 5 emergency contacts allowed.</div>
      )}
    </div>
  );
}
