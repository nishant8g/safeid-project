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

// Phase 1: Simple Localized Translation Dictionary
const translations = {
  en: { scanProfile: 'Scanned Emergency Profile', blood: 'Blood Group', donor: 'Organ Donor', allergies: 'Allergies', conditions: 'Medical Conditions', medications: 'Medications', notes: 'Notes', notify: 'NOTIFY FAMILY', call: 'Call' },
  fr: { scanProfile: "Profil d'urgence", blood: 'Groupe Sanguin', donor: 'Donneur', allergies: 'Allergies', conditions: 'Maladies', medications: 'Médicaments', notes: 'Notes', notify: 'ALERTER LA FAMILLE', call: 'Appeler' },
  es: { scanProfile: 'Perfil de Emergencia', blood: 'Sanguíneo', donor: 'Donante', allergies: 'Alergias', conditions: 'Condiciones', medications: 'Medicamentos', notes: 'Notas', notify: 'AVISAR FAMILIA', call: 'Llamar' },
  hi: { scanProfile: 'आपातकालीन प्रोफ़ाइल', blood: 'रक्त समूह', donor: 'अंग दाता', allergies: 'एलर्जी', conditions: 'चिकित्सा स्थिति', medications: 'दवाएं', notes: 'नोट्स', notify: 'परिवार को सूचित करें', call: 'कॉल करें' }
};

export default function ScanPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Detect user language (fallback to English)
  const userLang = (navigator.language || navigator.userLanguage).substring(0, 2);
  const t = translations[userLang] || translations['en'];

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Alert flow state
  const [step, setStep] = useState('request-location'); // request-location → request-photo → processing → info (revealed)
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [alertResult, setAlertResult] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);

  // Load user data
  useEffect(() => {
    loadScanData();
    requestLocation(true); // Silent request on load
  }, [userId]);

  const loadScanData = async () => {
    try {
      const res = await scanAPI.getData(userId);
      setUserData(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setIsDeactivated(true);
      } else {
        setError(
          err.response?.status === 404
            ? 'SafeID not found. This QR code may be invalid.'
            : 'Failed to load emergency data. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Request GPS (Upgraded to watchPosition for Bug 2)
  const requestLocation = (silent = false) => {
    if (!navigator.geolocation) {
      setLocationError('Location not supported on this device');
      if (!silent) setStep('request-photo');
      return;
    }

    // Capture initial position and start watching
    navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!silent && step === 'request-location') setStep('request-photo');
      },
      (err) => {
        console.warn('Location error:', err);
        setLocationError('Location access denied.');
        // We don't auto-skip on error unless it's a silent load check
        if (!silent && step === 'request-location') setStep('request-photo');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSkipLocation = () => {
    setStep('request-photo');
  };

  // Heartbeat Effect: Push live coordinates to backend if an alert is active
  useEffect(() => {
    if (activeAlertId && location) {
      const sendHeartbeat = async () => {
        const formData = new FormData();
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
        try {
          await alertAPI.liveUpdate(activeAlertId, formData);
        } catch (err) {
          console.error('Heartbeat failed:', err);
        }
      };
      
      const timer = setTimeout(sendHeartbeat, 5000); // Send update every 5 seconds
      return () => clearTimeout(timer);
    }
  }, [location, activeAlertId]);

  // Handle emergency button click
  const handleEmergencyClick = () => {
    // If we don't have location yet, try one more time
    if (!location) {
      requestLocation();
    } else {
      setStep('confirm');
    }
  };

  // Handle Photo Submission (Bug 1: Mandatory Step)
  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStep('processing'); // Lock UI while cloud upload happens
    setIsUploading(true);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('latitude', location?.lat || 0);
    formData.append('longitude', location?.lng || 0);
    formData.append('photo', file);

    try {
      const res = await alertAPI.reportIncident(formData);
      setAlertResult(res.data);
      setActiveAlertId(res.data.alert_id); // Enable live heartbeat
      setStep('info'); // REVEAL MEDICAL PROFILE
    } catch (err) {
      setError('Photo upload failed, but SOS was sent. Emergency profile unlocked.');
      setStep('info'); // Reveal profile anyway as failsafe
    } finally {
      setIsUploading(false);
    }
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
      setActiveAlertId(res.data.alert_id); // Enable live heartbeat
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

  // ──── STAGE 1: LOCATION LOCK (SKIPABLE) ────
  if (step === 'request-location') {
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh', padding: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>📍</div>
          <h2>Live Tracking Request</h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            We need your location to alert the family of the exact accident spot.
          </p>
          <div className="flex flex-col w-full" style={{ gap: '1rem', maxWidth: '300px' }}>
            <button className="btn btn-primary btn-lg w-full" onClick={() => requestLocation(false)}>
              Allow Live Tracking
            </button>
            <button className="btn btn-ghost w-full" onClick={handleSkipLocation}>
              Skip (Use Static Location)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── STAGE 2: PHOTO LOCK (MANDATORY) ────
  if (step === 'request-photo') {
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh', padding: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>📸</div>
          <h2>Accident Evidence</h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <strong>Mandatory:</strong> Please take a live photo of the accident scene to help the family understand the situation.
          </p>
          <label className="btn btn-danger btn-lg w-full" style={{ maxWidth: '300px', cursor: 'pointer' }}>
            📷 Capture & Unlock Profile
            <input 
              type="file" 
              accept="image/*" 
              capture="camera" 
              onChange={handlePhotoCapture}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    );
  }

  // ──── STAGE 3: PROCESSING (MMS / CLOUD UPLOAD) ────
  if (step === 'processing' || isUploading) {
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--accent-red)' }}></div>
          <h2>Uploading Report...</h2>
          <p className="text-muted">Contacting family via Cloud SMS & WhatsApp</p>
        </div>
      </div>
    );
  }

  // ──── MAIN VIEW (REVEALED ONLY AFTER DATA CAPTURE) ────
  return (
    <div className="scan-page">
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 1 }}>

        {/* Success Banner if alert was just sent */}
        {alertResult && (
          <div className="alert alert-success animate-bounce-in" style={{ marginTop: '1rem', border: '2px solid var(--accent-green)' }}>
            ✅ <strong>Alert Broadcasted!</strong> Family has been notified with your photo and location.
          </div>
        )}

        {/* Header */}
        <div className="scan-header">
          <div className="safeid-badge">🛡️ SafeID Emergency Profile</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            {userData.full_name}
          </h1>
          <p className="text-muted">{t.scanProfile}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Medical Info */}
        <div className="glass-card emergency animate-slide-up">
           {/* ... existing medical grid content ... */}
          <div className="medical-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="medical-item highlight">
              <div className="item-label">🩸 {t.blood}</div>
              <div className="item-value" style={{ fontSize: '1.5rem', color: 'var(--accent-red)' }}>
                {userData.blood_group || '—'}
              </div>
            </div>
            <div className="medical-item">
              <div className="item-label">💊 {t.donor}</div>
              <div className="item-value">
                {userData.organ_donor ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </div>

          {userData.allergies && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">⚠️ {t.allergies}</div>
              <div className="item-value" style={{ fontSize: '1rem', color: '#f87171' }}>
                {userData.allergies}
              </div>
            </div>
          )}

          {userData.conditions && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">🏥 {t.conditions}</div>
              <div className="item-value" style={{ fontSize: '1rem' }}>
                {userData.conditions}
              </div>
            </div>
          )}
          
          {userData.medications && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">💊 {t.medications}</div>
              <div className="item-value" style={{ fontSize: '0.95rem' }}>
                {userData.medications}
              </div>
            </div>
          )}

          {userData.special_notes && (
            <div className="medical-item" style={{ marginTop: '0.75rem' }}>
              <div className="item-label">📝 {t.notes}</div>
              <div className="item-value" style={{ fontSize: '0.95rem' }}>
                {userData.special_notes}
              </div>
            </div>
          )}
        </div>

        {/* Final Emergency Actions */}
        <div className="animate-slide-up" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Manual Notification Fallback</h3>
            {/* If Cloud SMS failed, let the rescuer push manually via Native URI */}
            <div className="glass-card" style={{ padding: '1rem' }}>
                 <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Press below to trigger <strong>Native Messaging</strong> if the cloud alert was delayed.
                 </p>
                 <div className="flex flex-col" style={{ gap: '0.75rem' }}>
                    {alertResult?.contacts_list?.map((contact, idx) => (
                         <div key={idx} className="flex" style={{ gap: '0.5rem' }}>
                            <a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(alertResult.sos_message)}`} 
                               className="btn flex-1" style={{ backgroundColor: '#25D366' }}>WhatsApp {contact.name}</a>
                            <a href={`sms:${contact.phone}?body=${encodeURIComponent(alertResult.sos_message)}`} 
                               className="btn flex-1" style={{ backgroundColor: '#3b82f6' }}>Direct SMS</a>
                         </div>
                    ))}
                 </div>
            </div>

            <div className="flex" style={{ gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                <a href="tel:112" className="btn btn-danger btn-lg">📞 Call 112</a>
                <a href="tel:108" className="btn btn-ghost btn-lg">🚑 Call 108</a>
            </div>
        </div>

        {/* Footer */}
        <div className="text-center" style={{ padding: '2rem 0 1rem', opacity: 0.4, fontSize: '0.75rem' }}>
          Powered by SafeID · AI Emergency Response System
        </div>
      </div>
    </div>
  );
}
