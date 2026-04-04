/**
 * Dashboard — User overview with quick actions.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, qrAPI, aiAPI } from '../api/client';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const [medical, setMedical] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [qrInfo, setQrInfo] = useState(null);
  const [risks, setRisks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [medRes, contactsRes, qrRes] = await Promise.allSettled([
        userAPI.getMedical(),
        userAPI.getContacts(),
        qrAPI.getInfo(),
      ]);

      if (medRes.status === 'fulfilled') setMedical(medRes.value.data);
      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value.data);
      if (qrRes.status === 'fulfilled') setQrInfo(qrRes.value.data);

      // Try AI risk prediction
      try {
        const riskRes = await aiAPI.getRiskPrediction();
        setRisks(riskRes.data);
      } catch {}
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const completionScore = [medical, contacts.length > 0, qrInfo?.has_qr].filter(Boolean).length;
  const completionPercent = Math.round((completionScore / 3) * 100);

  return (
    <div className="page-container animate-fade-in">
      {/* Welcome Header */}
      <div className="section-header">
        <div className="section-tag">Dashboard</div>
        <h2>Welcome, {user?.full_name?.split(' ')[0]} 👋</h2>
        <p>Manage your SafeID profile and stay prepared.</p>
      </div>

      <AnalyticsDashboard completionPercent={completionPercent} />

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🩸</div>
          <div className="stat-value">{medical?.blood_group || '—'}</div>
          <div className="stat-label">Blood Group</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{contacts.length}</div>
          <div className="stat-label">Emergency Contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-value">{qrInfo?.has_qr ? '✅' : '❌'}</div>
          <div className="stat-label">QR Code</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Medical Summary */}
        <div className="glass-card">
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>🩺 Medical Info</h3>
            <Link to="/profile" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
              Edit
            </Link>
          </div>
          {medical ? (
            <div className="medical-grid">
              <div className="medical-item highlight">
                <div className="item-label">Blood Group</div>
                <div className="item-value">{medical.blood_group || '—'}</div>
              </div>
              <div className="medical-item">
                <div className="item-label">Allergies</div>
                <div className="item-value" style={{ fontSize: '0.9rem' }}>{medical.allergies || 'None'}</div>
              </div>
              <div className="medical-item">
                <div className="item-label">Conditions</div>
                <div className="item-value" style={{ fontSize: '0.9rem' }}>{medical.conditions || 'None'}</div>
              </div>
              <div className="medical-item">
                <div className="item-label">Organ Donor</div>
                <div className="item-value">{medical.organ_donor ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>
          ) : (
            <p className="text-muted">No medical info yet. <Link to="/profile">Add now →</Link></p>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="glass-card">
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>👥 Emergency Contacts</h3>
            <Link to="/contacts" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
              Manage
            </Link>
          </div>
          {contacts.length > 0 ? (
            <div className="flex flex-col" style={{ gap: '0.5rem' }}>
              {contacts.slice(0, 3).map((c) => (
                <div key={c.id} className="contact-card" style={{ padding: '0.75rem 1rem' }}>
                  <div className="contact-info">
                    <div className="contact-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                      {c.name[0]}
                    </div>
                    <div className="contact-details">
                      <h4 style={{ fontSize: '0.9rem' }}>{c.name}</h4>
                      <p>{c.relationship || 'Contact'}</p>
                    </div>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>#{c.priority}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No contacts yet. <Link to="/contacts">Add now →</Link></p>
          )}
        </div>
      </div>

      {/* AI Risk Predictions */}
      {risks && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            🧠 AI Health Risk Assessment
          </h3>
          <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
            <span className={`badge ${
              risks.risk_level === 'high' ? 'badge-red' :
              risks.risk_level === 'medium' ? 'badge-yellow' : 'badge-green'
            }`}>
              Risk: {risks.risk_level?.toUpperCase()}
            </span>
          </div>
          {risks.warnings?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>⚠️ Warnings</h4>
              {risks.warnings.map((w, i) => (
                <div key={i} className="alert alert-warning" style={{ marginBottom: '0.5rem' }}>{w}</div>
              ))}
            </div>
          )}
          {risks.recommendations?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>💡 Recommendations</h4>
              {risks.recommendations.map((r, i) => (
                <div key={i} className="alert alert-info" style={{ marginBottom: '0.5rem' }}>{r}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
