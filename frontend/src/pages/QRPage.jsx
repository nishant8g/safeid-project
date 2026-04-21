/**
 * QR Page — Generate, view, and download QR code.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { qrAPI } from '../api/client';

export default function QRPage() {
  const { user } = useAuth();
  const [qrInfo, setQrInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQR();
  }, []);

  const loadQR = async () => {
    try {
      const res = await qrAPI.getInfo();
      setQrInfo(res.data);
    } catch (err) {
      console.warn("Failed to load existing QR info:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await qrAPI.generate();
      setQrInfo({
        has_qr: true,
        scan_url: res.data.scan_url,
        sms_fallback_code: res.data.sms_fallback_code,
        download_url: res.data.download_url,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!user?.id) return;
    const url = qrAPI.getImageUrl(user.id);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SafeID_QR_${user.full_name.replace(/\s+/g, '_')}.png`;
    link.click();
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
      <div className="section-header text-center" style={{ marginBottom: '3rem' }}>
        <div className="section-tag" style={{ background: 'rgba(0, 97, 255, 0.1)', color: '#0061FF', fontWeight: '700' }}>Quick Access</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>📱 SafeID QR Code</h2>
        <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: '500' }}>Print this QR code and keep it with you. Anyone can scan it in an emergency.</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        {qrInfo?.has_qr ? (
          <div className="qr-container">
            {/* QR Code Image */}
            <div className="qr-frame" style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(0,0,0,0.05)' }}>
              <img
                src={`${qrAPI.getImageUrl(user.id)}?t=${Date.now()}`}
                alt="SafeID QR Code"
                style={{ width: '250px', height: '250px', display: 'block' }}
                id="qr-image"
              />
            </div>

            {/* Scan URL */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Scan URL</p>
              <code style={{
                padding: '0.6rem 1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: '#0061FF',
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
                border: '1px solid rgba(0, 97, 255, 0.1)'
              }}>
                {qrInfo.scan_url}
              </code>
            </div>

            {/* SMS Fallback */}
            <div className="qr-fallback" style={{ width: '100%', background: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(226, 232, 240, 1)', padding: '20px', borderRadius: '20px' }}>
              <div className="fallback-label" style={{ color: '#0f172a', fontWeight: '800' }}>📵 No Internet Fallback</div>
              <div className="fallback-code" style={{ color: '#0061FF', fontSize: '1.5rem', letterSpacing: '4px' }}>{qrInfo.sms_fallback_code}</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', marginTop: '0.5rem' }}>
                Print this code below your QR for offline SMS emergency
              </p>
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: '1rem', width: '100%' }}>
              <button className="btn btn-primary btn-full" onClick={downloadQR} id="download-qr" style={{ padding: '1rem', borderRadius: '14px', fontWeight: '700' }}>
                ⬇️ Download QR
              </button>
              <button className="btn btn-ghost btn-full" onClick={generateQR} disabled={generating} style={{ padding: '1rem', borderRadius: '14px', fontWeight: '700', color: '#0061FF' }}>
                🔄 Regenerate
              </button>
            </div>

            {/* Tips */}
            <div style={{
              width: '100%', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,1)'
            }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: '800' }}>💡 Pro-Tip Placement:</h4>
              <ul style={{ color: '#475569', paddingLeft: '1.2rem', lineHeight: '1.6', fontWeight: '500' }}>
                <li>Back of your phone case</li>
                <li>Inside your wallet</li>
                <li>On your helmet</li>
                <li>On your ID card / lanyard</li>
                <li>Medical bracelet or keychain</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
            <h3>Generate Your QR Code</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Create a unique QR code linked to your SafeID profile. Anyone who scans it can instantly
              see your medical info and notify your emergency contacts.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={generateQR}
              disabled={generating}
              id="generate-qr"
            >
              {generating ? 'Generating...' : '⚡ Generate QR Code'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
