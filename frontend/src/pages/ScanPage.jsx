/**
 * 🔥 ScanPage — THE CRITICAL RESCUER VIEW
 *
 * This is what a bystander sees after scanning the QR code.
 * Must be: extremely simple, fast, and zero-friction.
 *
 * Flow:
 * 1. Show medical info (blood, allergies, conditions)
 * 2. Big "NOTIFY FAMILY" button
 * 3. Request GPS permission
 * 4. Confirmation slider (anti-prank)
 * 5. Send alert → show success
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scanAPI, alertAPI } from '../api/client';
import ConfirmSlider from '../components/ConfirmSlider';
import VoiceInput from '../components/VoiceInput';
import SeverityBadge from '../components/SeverityBadge';

export default function ScanPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Alert flow state
  const [step, setStep] = useState('info'); // info → confirm → sending → sent
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [alertResult, setAlertResult] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Load user data
  useEffect(() => {
    loadScanData();
  }, [userId]);

  const loadScanData = async () => {
    try {
      const res = await scanAPI.getData(userId);
      setUserData(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'SafeID not found. This QR code may be invalid.'
          : 'Failed to load emergency data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Request GPS
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location not supported on this device');
      setStep('confirm');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStep('confirm');
      },
      (err) => {
        setLocationError('Location access denied. Alert will be sent without location.');
        setStep('confirm');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle emergency button click
  const handleEmergencyClick = () => {
    requestLocation();
  };

  // Handle slider confirmation
  const handleConfirm = async () => {
    setStep('sending');
    try {
      const res = await alertAPI.trigger({
        user_id: userId,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        triggered_by: voiceTranscript ? 'voice' : 'button',
        severity: 'unknown',
        message_override: voiceTranscript || null,
      });
      setAlertResult(res.data);
      setStep('sent');
    } catch (err) {
      setError('Failed to send alert. Please call emergency services directly.');
      setStep('info');
    }
  };

  // Voice trigger
  const handleVoiceTrigger = (text) => {
    setVoiceTranscript(text);
    handleEmergencyClick();
  };

  // ──── LOADING ────
  if (loading) {
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
          <div className="spinner"></div>
          <p>Loading emergency data...</p>
        </div>
      </div>
    );
  }

  // ──── ERROR ────
  if (error && !userData) {
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
          <div style={{ fontSize: '4rem' }}>⚠️</div>
          <h2>SafeID Error</h2>
          <p className="text-muted" style={{ maxWidth: '400px', textAlign: 'center' }}>{error}</p>
          <a href="tel:112" className="btn btn-danger btn-lg" style={{ marginTop: '1rem' }}>
            📞 Call Emergency Services (112)
          </a>
        </div>
      </div>
    );
  }

  // ──── SENT ────
  if (step === 'sent') {
    return (
      <div className="scan-page">
        <div className="success-page" style={{ flexDirection: 'column', padding: '2rem' }}>
          <div className="success-icon animate-scale-in">✅</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Help is on the way!</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            Emergency alerts have been sent to {alertResult?.contacts_notified || 0} contacts via SMS and WhatsApp.
          </p>

          {alertResult?.sos_message && (
            <div className="glass-card" style={{
              maxWidth: '500px', width: '100%', textAlign: 'left',
              marginBottom: '1.5rem',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                📨 Message sent:
              </p>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {alertResult.sos_message}
              </p>
            </div>
          )}

          <div className="flex" style={{ gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="tel:112" className="btn btn-danger btn-lg">
              📞 Call 112 (Emergency)
            </a>
            <a href="tel:108" className="btn btn-ghost btn-lg">
              🚑 Call 108 (Ambulance)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ──── MAIN VIEW ────
  return (
    <div className="scan-page">
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="scan-header">
          <div className="safeid-badge">🛡️ SafeID Emergency</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            {userData.full_name}
          </h1>
          <p className="text-muted">Scanned Emergency Profile</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Medical Info */}
        <div className="glass-card emergency animate-slide-up" style={{ marginBottom: '1rem' }}>
          <div className="medical-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="medical-item highlight">
              <div className="item-label">🩸 Blood Group</div>
              <div className="item-value" style={{ fontSize: '1.5rem', color: 'var(--accent-red)' }}>
                {userData.blood_group || '—'}
              </div>
            </div>
            <div className="medical-item">
              <div className="item-label">💊 Organ Donor</div>
              <div className="item-value">
                {userData.organ_donor ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </div>

          {userData.allergies && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">⚠️ Allergies</div>
              <div className="item-value" style={{ fontSize: '1rem', color: '#f87171' }}>
                {userData.allergies}
              </div>
            </div>
          )}

          {userData.conditions && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">🏥 Medical Conditions</div>
              <div className="item-value" style={{ fontSize: '1rem' }}>
                {userData.conditions}
              </div>
            </div>
          )}

          {userData.medications && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">💊 Medications</div>
              <div className="item-value" style={{ fontSize: '0.95rem' }}>
                {userData.medications}
              </div>
            </div>
          )}

          {userData.special_notes && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">📝 Notes</div>
              <div className="item-value" style={{ fontSize: '0.95rem' }}>
                {userData.special_notes}
              </div>
            </div>
          )}
        </div>

        {/* Action Area */}
        {step === 'info' && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Emergency Button */}
            <button
              className="emergency-btn pulsing"
              onClick={handleEmergencyClick}
              id="notify-family-btn"
            >
              🚨 NOTIFY FAMILY
            </button>

            {/* Voice Input */}
            <div style={{ marginTop: '1.5rem' }}>
              <VoiceInput
                onTranscript={setVoiceTranscript}
                onTriggerWord={handleVoiceTrigger}
              />
            </div>

            {/* Direct call */}
            <div className="flex" style={{
              gap: '0.75rem', marginTop: '1.5rem',
              justifyContent: 'center', flexWrap: 'wrap',
            }}>
              <a href="tel:112" className="btn btn-ghost">📞 Call 112</a>
              <a href="tel:108" className="btn btn-ghost">🚑 Call 108</a>
            </div>

            {/* SMS Fallback */}
            {userData.sms_fallback_code && (
              <div className="qr-fallback" style={{ marginTop: '1.5rem' }}>
                <div className="fallback-label">📵 No Internet? SMS Fallback</div>
                <div className="fallback-code">{userData.sms_fallback_code}</div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Text this code to emergency services
                </p>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div className="animate-slide-up">
            {locationError && (
              <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                📍 {locationError}
              </div>
            )}
            {location && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                📍 Location captured successfully
              </div>
            )}

            <div className="glass-card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                ⚠️ This will send emergency alerts to {userData.full_name}'s family.
                <br />Slide to confirm this is a real emergency.
              </p>
              <ConfirmSlider
                onConfirm={handleConfirm}
                label="Slide to send alert"
              />
            </div>

            <button className="btn btn-ghost btn-full" onClick={() => setStep('info')}>
              ← Go Back
            </button>
          </div>
        )}

        {/* Sending */}
        {step === 'sending' && (
          <div className="loading-overlay animate-fade-in" style={{ minHeight: '200px' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-red)' }}></div>
            <p>Sending emergency alerts...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Contacting family via SMS & WhatsApp
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center" style={{ padding: '2rem 0 1rem', opacity: 0.4, fontSize: '0.75rem' }}>
          Powered by SafeID · AI Emergency Response System
        </div>
      </div>
    </div>
  );
}
