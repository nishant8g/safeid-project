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
    const d = new Date(iso);
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
      <div className="section-header">
        <div className="section-tag">Alert History</div>
        <h2>📋 Emergency Alert Logs</h2>
        <p>Detailed history of all emergency alerts triggered for your profile.</p>
      </div>

      {/* Backend Links */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🔗 Backend & API Access</h3>
        <div className="flex flex-col" style={{ gap: '0.5rem' }}>
          <a
            href={`http://${window.location.hostname}:8000/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start' }}
          >
            📚 API Documentation (Swagger UI)
          </a>
          <a
            href={`http://${window.location.hostname}:8000/redoc`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start' }}
          >
            📖 API Reference (ReDoc)
          </a>
          <a
            href={`http://${window.location.hostname}:8000/health`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start' }}
          >
            🏥 Health Check (Service Status)
          </a>
        </div>
      </div>

      {/* Alert History */}
      {alerts.length > 0 ? (
        <div className="flex flex-col" style={{ gap: '1rem' }}>
          {alerts.map((alert) => (
            <div key={alert.id} className="glass-card">
              <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                <div className="flex items-center" style={{ gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚨</span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>Emergency Alert</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(alert.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`badge ${getSeverityColor(alert.severity)}`}>
                  {alert.severity?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>

              <div className="medical-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="medical-item">
                  <div className="item-label">Triggered By</div>
                  <div className="item-value" style={{ fontSize: '0.95rem' }}>
                    {alert.triggered_by === 'voice' ? '🎤 Voice' : '👆 Button'}
                  </div>
                </div>
                <div className="medical-item">
                  <div className="item-label">Contacts Notified</div>
                  <div className="item-value" style={{ fontSize: '0.95rem' }}>
                    {alert.contacts_notified?.length || 0} contacts
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
            Each alert logs: time, location, severity, contacts notified, and the SOS message sent.
          </p>
        </div>
      )}

      {/* SMS Info */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>📱 How SMS Alerts Work</h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <p><strong>When NOTIFY FAMILY is clicked:</strong></p>
          <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
            <li>GPS location is captured from the rescuer's phone</li>
            <li>AI generates a context-aware SOS message with your medical info</li>
            <li>SMS is sent to all your emergency contacts via Twilio</li>
            <li>WhatsApp message is also sent as backup</li>
            <li>Message includes Google Maps link to the exact location</li>
          </ol>
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            ℹ️ With Twilio trial account, SMS can only be sent to verified phone numbers.
            Add your phone in the{' '}
            <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified" target="_blank" rel="noopener noreferrer">
              Twilio Console → Verified Numbers
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
