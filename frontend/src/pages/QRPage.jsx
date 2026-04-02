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
    } catch {
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
      <div className="section-header text-center">
        <div className="section-tag">Your QR Code</div>
        <h2>📱 SafeID QR Code</h2>
        <p>Print this QR code and keep it with you. Anyone can scan it in an emergency.</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        {qrInfo?.has_qr ? (
          <div className="qr-container">
            {/* QR Code Image */}
            <div className="qr-frame">
              <img
                src={qrAPI.getImageUrl(user.id)}
                alt="SafeID QR Code"
                style={{ width: '250px', height: '250px' }}
                id="qr-image"
              />
            </div>

            {/* Scan URL */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Scan URL</p>
              <code style={{
                padding: '0.4rem 0.8rem',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--accent-blue)',
                fontFamily: 'var(--font-mono)',
              }}>
                {qrInfo.scan_url}
              </code>
            </div>

            {/* SMS Fallback */}
            <div className="qr-fallback" style={{ width: '100%' }}>
              <div className="fallback-label">📵 No Internet Fallback</div>
              <div className="fallback-code">{qrInfo.sms_fallback_code}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Print this code below your QR for offline SMS emergency
              </p>
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: '0.75rem', width: '100%' }}>
              <button className="btn btn-primary btn-full" onClick={downloadQR} id="download-qr">
                ⬇️ Download QR Code
              </button>
              <button className="btn btn-ghost btn-full" onClick={generateQR} disabled={generating}>
                🔄 Regenerate
              </button>
            </div>

            {/* Tips */}
            <div style={{
              width: '100%', padding: '1rem', background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-md)', fontSize: '0.85rem',
            }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>💡 Where to put your QR code:</h4>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
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
