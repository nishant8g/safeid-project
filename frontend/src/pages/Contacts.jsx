/**
 * Contacts Page — Manage emergency contacts.
 */
import { useState, useEffect } from 'react';
import { userAPI } from '../api/client';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', relationship: '', priority: 1 });
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
      setFormData({ name: '', phone: '', email: '', relationship: '', priority: contacts.length + 1 });
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
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag" style={{ background: 'rgba(0, 97, 255, 0.1)', color: '#0061FF', fontWeight: '700' }}>Protection Circle</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>👥 Emergency Contacts</h2>
        <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: '500' }}>These people will be notified via SMS and WhatsApp when your QR code is scanned in an emergency.</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Contact List */}
      <div className="flex flex-col" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-card" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 1)', borderRadius: '20px', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow-md)' }}>
            <div className="contact-info">
              <div className="contact-avatar" style={{ background: 'linear-gradient(135deg, #0061FF 0%, #0044CC 100%)', color: 'white', fontWeight: '700' }}>{contact.name[0]}</div>
              <div className="contact-details">
                <h4 style={{ color: '#0f172a', fontWeight: '800', fontSize: '1.1rem' }}>{contact.name}</h4>
                <p style={{ color: '#475569', fontWeight: '600' }}>{contact.relationship || 'Emergency Contact'} · {contact.phone}</p>
                {contact.email && <p style={{ fontSize: '0.85rem', color: '#0061FF', fontWeight: '700' }}>✉️ {contact.email}</p>}
              </div>
            </div>
            <div className="contact-actions">
              <span className="badge" style={{ fontSize: '0.8rem', marginRight: '0.75rem', background: 'rgba(0, 97, 255, 0.1)', color: '#0061FF', fontWeight: '700', padding: '4px 12px', borderRadius: '10px' }}>
                Priority #{contact.priority}
              </span>
              <button className="icon-btn danger" onClick={() => handleDelete(contact.id)} title="Remove" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '10px', width: '36px', height: '36px' }}>
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
        <div className="glass-card animate-slide-up" style={{ border: '1px solid rgba(255, 255, 255, 1)', padding: '40px' }}>
          <h3 style={{ marginBottom: '2rem', fontWeight: '800', color: '#0f172a' }}>➕ Add Emergency Contact</h3>
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
                <label className="form-label">Email (for alerts)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="contact@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  id="contact-email"
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
          <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowForm(true)} id="add-contact-btn" style={{ padding: '1.25rem', borderRadius: '16px', fontSize: '1.2rem', fontWeight: '700', boxShadow: '0 10px 30px rgba(0, 97, 255, 0.25)' }}>
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
