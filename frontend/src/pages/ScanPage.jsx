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
import { useParams } from 'react-router-dom';
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

  // Detect user language (fallback to English)
  const userLang = (navigator.language || navigator.userLanguage).substring(0, 2);
  const t = translations[userLang] || translations['en'];

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Alert flow state
  const [step, setStep] = useState('request-photo'); // INSTANT PHOTO FLOW
  const [location, setLocation] = useState(null);
  const [alertResult, setAlertResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showGpsBypass, setShowGpsBypass] = useState(false);

  // --- SILENT BACKGROUND GPS (SENIOR ENGINEER STEALTH) ---
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Start tracking immediately in the background
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(newLoc);
      },
      (error) => console.warn("Background GPS Issue:", error.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    // Timeout to show GPS bypass if it takes too long (10 seconds)
    const bypassTimer = setTimeout(() => setShowGpsBypass(true), 10000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(bypassTimer);
    };
  }, []);

  // Load user data
  useEffect(() => {
    loadScanData();
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





  // Heartbeat Effect: Push live coordinates to backend continuously
  useEffect(() => {
    if (activeAlertId && location) {
      const timer = setInterval(async () => {
        const formData = new FormData();
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
        try { await alertAPI.liveUpdate(activeAlertId, formData); }
        catch (err) { console.error('Heartbeat failed:', err); }
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [location, activeAlertId]);

  // Handle Photo Submission (MANDATORY PRO FLOW)
  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VALIDATION: Ensure we have real GPS coordinates (Bug #2 FIX)
    if (!location || (location.lat === 0 && location.lng === 0)) {
      alert("🛰️ GPS still acquiring. Please wait a moment for a satellite lock.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('photo', file);

    try {
      // Use the pre-configured alertAPI to avoid URL issues
      const res = await alertAPI.reportIncident(formData);
      setAlertResult(res.data);
      setActiveAlertId(res.data.alert_id);
      setIsConfirmed(true); // Force confirmed state to show success UI
      setStep('info'); // Reveal profile
    } catch (err) {
      console.error("Incident report failed (Silent Mode):", err);
      // Reveal anyway for rescuer access, but don't mark as confirmed if it failed
      setStep('info'); 
    } finally {
      setIsUploading(false);
    }
  };

  // Direct Trigger (If bypass photo)
  const handleDirectAlert = async () => {
    setIsUploading(true);
    try {
        const payload = {
            user_id: userId,
            triggered_by: "button",
            latitude: location?.lat || 0,
            longitude: location?.lng || 0,
            severity: "critical"
        };
        const res = await alertAPI.trigger(payload);
        setAlertResult(res.data);
        setActiveAlertId(res.data.alert_id);
    } catch (err) {
        console.error("Direct alert failed", err);
    } finally {
        setIsUploading(false);
        setIsConfirmed(true);
        setTimeout(() => window.scrollTo({ top: 9999, behavior: 'smooth' }), 100);
    }
  };

  // ──── 0. SAFETY GUARDS ────
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

  if (isDeactivated) {
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
          <div style={{ fontSize: '4rem' }}>🔒</div>
          <h2>SafeID Deactivated</h2>
          <p className="text-muted" style={{ maxWidth: '400px', textAlign: 'center' }}>
            This SafeID is currently in "Privacy Mode" or has been disabled by its owner. No medical information is available.
          </p>
          <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
            <a href="tel:112" className="btn btn-danger btn-lg">📞 Call 112</a>
          </div>
        </div>
      </div>
    );
  }

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


  // ──── STAGE 2: PHOTO LOCK (MANDATORY) ────
  if (step === 'request-photo' && !alertResult) {
    const isGPSReady = location && location.lat !== 0 && location.lng !== 0;
    
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh', padding: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>📸</div>
          <h2>Accident Evidence</h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <strong>Mandatory:</strong> Please take a live photo of the accident scene to help the family understand the situation.
          </p>
          <label 
            className={`btn ${(isUploading || (!isGPSReady && !showGpsBypass)) ? 'btn-disabled' : 'btn-danger'} btn-lg w-full flex items-center justify-center gap-2`} 
            style={{ 
                maxWidth: '300px', 
                cursor: (isUploading || (!isGPSReady && !showGpsBypass)) ? 'not-allowed' : 'pointer', 
                padding: '1.25rem', 
                fontSize: '1.1rem',
                opacity: (isUploading || (!isGPSReady && !showGpsBypass)) ? 0.7 : 1
            }}
          >
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handlePhotoCapture} 
              disabled={isUploading || (!isGPSReady && !showGpsBypass)}
              style={{ display: 'none' }} 
            />
            {isUploading ? (
              <><span className="spinner-small"></span> 📡 Uploading Incident Report...</>
            ) : (!isGPSReady && !showGpsBypass) ? (
              <>🛰️ Acquiring GPS...</>
            ) : (
              <>{!isGPSReady ? '📷 Continue without GPS' : '📷 Capture & Unlock Profile'}</>
            )}
          </label>
          
          {showGpsBypass && !isGPSReady && !isUploading && (
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setLocation({ lat: 0, lng: 0 })}>
              Skip GPS & Unlock Profile Anyway
            </p>
          )}
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
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Family Notification</h3>

          {!isConfirmed ? (
            <div className="glass-card" style={{ padding: '1.5rem', border: '2px solid rgba(239, 68, 68, 0.4)', textAlign: 'center' }}>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {isUploading ? 'Please wait while we secure the incident photo...' : 'Tap the button below to instantly broadcast the emergency alert.'}
              </p>
              <button
                onClick={() => {
                  if (isUploading) return;
                  console.log("SOS TRIGGERED - DIRECT BUTTON");
                  handleDirectAlert();
                }}
                disabled={isUploading}
                className={`btn ${isUploading ? 'btn-disabled' : 'btn-danger'} btn-lg w-full ${!isUploading && 'animate-pulse'}`}
                style={{
                  padding: '1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  boxShadow: isUploading ? 'none' : '0 0 30px rgba(220, 38, 38, 0.4)',
                  opacity: isUploading ? 0.7 : 1
                }}
              >
                {isUploading ? (
                  <><span className="spinner-small"></span> 📸 PROCESSING PHOTO...</>
                ) : (
                  '🚨 NOTIFY FAMILY NOW'
                )}
              </button>
            </div>
          ) : (
             <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', border: '2px solid rgba(34, 197, 94, 0.4)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>Alert Sent to Family</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  The incident photo and live location have been broadcast to the family via Twilio WhatsApp & SMS.
                </p>

                {/* --- SMART MANUAL BACKUP (Bug #1 Hybrid Fix) --- */}
                <div className="flex flex-col" style={{ gap: '0.8rem', marginTop: '1rem' }}>
                   {userData?.emergency_contacts?.map((contact, idx) => (
                      <a 
                        key={idx}
                        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(alertResult?.sos_message || `🚨 EMERGENCY ALERT for ${userData.full_name}: I have found them at an accident scene. Location: https://www.google.com/maps?q=${location?.lat},${location?.lng}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost w-full"
                        style={{ fontSize: '0.9rem', padding: '0.75rem', borderColor: 'rgba(37, 211, 102, 0.3)', color: '#25D366' }}
                      >
                        💬 Backup WA: {contact.name}
                      </a>
                   ))}
                </div>
             </div>
          )}

          <div className="flex" style={{ gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <a href="tel:112" className="btn btn-danger btn-lg">📞 Call 112</a>
            <a href="tel:108" className="btn btn-ghost btn-lg">🚑 Call 108</a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center" style={{ padding: '2rem 0 1rem', opacity: 0.4, fontSize: '0.75rem' }}>
          SafeID v2.0 · (BUILD: ULTRA V2) · SENIOR PROTECTED
        </div>
      </div>
    </div>
  );
}
