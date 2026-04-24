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
      } catch (err) {
        console.warn('AI Risk prediction failed:', err);
      }
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
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', fontWeight: '700' }}>Overview</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Welcome, {user?.full_name?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>
          Manage your ResQ profile and stay prepared.
        </p>
      </div>

      <AnalyticsDashboard completionPercent={completionPercent} />

      {/* Primary Actions & Controls */}
      <div className="dashboard-grid" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>🚑</div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Privacy Shield</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggle QR accessibility for first responders.</p>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: qrInfo?.is_active ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              {qrInfo?.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <div 
              onClick={async () => {
                try {
                  const res = await qrAPI.toggle();
                  setQrInfo(prev => ({ ...prev, is_active: res.data.is_active }));
                } catch (err) {
                  console.error('Toggle failed:', err);
                }
              }}
              className={`toggle-pill ${qrInfo?.is_active ? 'active' : ''}`} 
              style={{ 
                width: '50px', 
                height: '26px', 
                background: qrInfo?.is_active ? 'var(--accent-emerald)' : '#334155', 
                borderRadius: '20px',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                boxShadow: qrInfo?.is_active ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <div style={{ 
                width: '20px', 
                height: '20px', 
                background: '#fff', 
                borderRadius: '50%', 
                position: 'absolute', 
                top: '3px', 
                left: qrInfo?.is_active ? '27px' : '3px',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem' }}>🩹</div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Biometric Data</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blood Group: <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{medical?.blood_group || 'Not Set'}</span></p>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="dashboard-grid">
        {/* Medical Summary */}
        <div className="glass-card" style={{ border: '1.2px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.3)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>🩺</span> Clinical Overview
            </h3>
            <Link to="/profile" className="btn btn-ghost" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Refine Details
            </Link>
          </div>
          {medical ? (
            <div className="medical-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div className="medical-item highlight" style={{ background: 'rgba(34, 211, 238, 0.05)' }}>
                <div className="item-label">Blood Type</div>
                <div className="item-value" style={{ color: 'var(--accent-cyan)' }}>{medical.blood_group || '—'}</div>
              </div>
              <div className="medical-item">
                <div className="item-label">Allergies</div>
                <div className="item-value">{medical.allergies || 'None'}</div>
              </div>
              <div className="medical-item">
                <div className="item-label">Conditions</div>
                <div className="item-value">{medical.conditions || 'None'}</div>
              </div>
              <div className="medical-item">
                <div className="item-label">Organ Donor</div>
                <div className="item-value">{medical.organ_donor ? 'Verified' : 'Unspecified'}</div>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '1rem' }}>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>No medical intelligence found.</p>
              <Link to="/profile" className="btn btn-primary btn-sm">Initialize Profile</Link>
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="glass-card" style={{ border: '1.2px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.3)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>👥</span> Safety Circle
            </h3>
            <Link to="/contacts" className="btn btn-ghost" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Modify
            </Link>
          </div>
          {contacts.length > 0 ? (
            <div className="flex flex-col" style={{ gap: '0.75rem' }}>
              {contacts.slice(0, 3).map((c) => (
                <div key={c.id} className="contact-card" style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="contact-info">
                    <div className="contact-avatar" style={{ background: 'var(--accent-cyan)', color: '#000', fontWeight: '800' }}>
                      {c.name[0]}
                    </div>
                    <div className="contact-details">
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{c.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.relationship}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                    <span className="badge" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', fontSize: '0.65rem' }}>PRIORITY {c.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ padding: '1rem' }}>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>Zero active responders linked.</p>
              <Link to="/contacts" className="btn btn-primary btn-sm">Connect Contact</Link>
            </div>
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
