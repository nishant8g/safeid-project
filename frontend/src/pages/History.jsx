/**
 * History Page — View alert history and backend info.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../api/client';

export default function History() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await alertAPI.getHistory(user?.id);
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    // Append Z to enforce UTC parsing since backend sends naive UTC string
    const utcDateStr = iso.endsWith('Z') ? iso : `${iso}Z`;
    const d = new Date(utcDateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const getSeverityColor = (sev) => {
    if (sev === 'critical') return 'badge-red';
    if (sev === 'moderate') return 'badge-yellow';
    if (sev === 'minor') return 'badge-green';
    return 'badge-purple';
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading alert history...</p>
      </div>
    );
  }

  return (
    <div className="page-container medium animate-fade-in">
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', fontWeight: '700' }}>Event Logs</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>📋 Emergency Alert Logs</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>Detailed history of all emergency alerts triggered for your profile.</p>
      </div>

      {/* Backend Links */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-subtle)', padding: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>🔗 Developer API Access</h3>
        <div className="flex flex-col" style={{ gap: '0.75rem' }}>
          <a
            href={`http://${window.location.hostname}:8000/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--accent-cyan)', borderRadius: '12px', fontWeight: '700', border: '1px solid var(--border-subtle)' }}
          >
            📚 API Documentation (Swagger)
          </a>
          <a
            href={`http://${window.location.hostname}:8000/redoc`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--accent-cyan)', borderRadius: '12px', fontWeight: '700', border: '1px solid var(--border-subtle)' }}
          >
            📖 API Reference (ReDoc)
          </a>
          <a
            href={`http://${window.location.hostname}:8000/health`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--accent-cyan)', borderRadius: '12px', fontWeight: '700', border: '1px solid var(--border-subtle)' }}
          >
            🏥 System Service Health
          </a>
        </div>
      </div>

      {/* Alert History */}
      {alerts.length > 0 ? (
        <div className="flex flex-col" style={{ gap: '1rem' }}>
          {alerts.map((alert) => (
            <div key={alert.id} className="glass-card" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', padding: '24px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
                <div className="flex items-center" style={{ gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🚨</div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '800' }}>Emergency SOS Triggered</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {formatDate(alert.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`badge ${getSeverityColor(alert.severity)}`} style={{ fontWeight: '700', letterSpacing: '0.05em', padding: '6px 12px', borderRadius: '8px' }}>
                  {alert.severity?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>

              <div className="medical-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="medical-item">
                  <div className="item-label" style={{ color: 'var(--text-muted)' }}>Trigger Method</div>
                  <div className="item-value" style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                    {alert.triggered_by === 'voice' ? '🎤 Voice Command' : '👆 Smart Button'}
                  </div>
                </div>
                <div className="medical-item">
                  <div className="item-label" style={{ color: 'var(--text-muted)' }}>Network Reach</div>
                  <div className="item-value" style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                    {alert.contacts_notified?.length || 0} Contacts Alerted
                  </div>
                </div>
              </div>

              {alert.address && (
                <div className="medical-item" style={{ marginTop: '0.75rem' }}>
                  <div className="item-label">📍 Location</div>
                  <div className="item-value" style={{ fontSize: '0.9rem' }}>{alert.address}</div>
                </div>
              )}

              {alert.contacts_notified?.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Notified Contacts
                  </div>
                  <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                    {alert.contacts_notified.map((c, i) => (
                      <span key={i} className="badge badge-blue">
                        {c.name || c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3>No Alert History</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            When someone scans your QR code and sends an emergency alert, it will appear here.
          </p>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Emergency contacts will be notified via SMS/WhatsApp including your live location.
          </p>
        </div>
      )}

      {/* SMS Info */}
      <div className="glass-card" style={{ marginTop: '2rem', border: '1px solid var(--border-subtle)', padding: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: '800' }}>📱 How Alert Propagation Works</h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: '500' }}>
          <p>When an emergency is detected, SafeID executes the following protocol:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
            <li><strong>Live GPS Lock:</strong> High-accuracy coordinates are captured from the active session.</li>
            <li><strong>AI Synapse:</strong> Gemini models generate a precise medical brief for first responders.</li>
            <li><strong>SMS Pulse:</strong> Encrypted alerts are dispatched via Twilio Global Network.</li>
            <li><strong>WhatsApp Sync:</strong> Secondary backup alerts are funneled through WhatsApp API.</li>
            <li><strong>Rescue Link:</strong> Contacts receive a real-time tracking link with your medical profile.</li>
          </ol>
          <div className="alert alert-info" style={{ marginTop: '1rem', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-subtle)' }}>
            ℹ️ With Twilio trial account, SMS can only be sent to verified phone numbers.
            Add your phone in the{' '}
            <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
              Twilio Console → Verified Numbers
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
