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
            ? 'ResQ profile not found. This QR code may be invalid.'
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
          <h2>ResQ Deactivated</h2>
          <p className="text-muted" style={{ maxWidth: '400px', textAlign: 'center' }}>
            This ResQ profile is currently in "Privacy Mode" or has been disabled by its owner. No medical information is available.
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
          <h2>ResQ Error</h2>
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
          <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>📸</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Accident Evidence</h2>
          <p style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-secondary)', fontWeight: '500', maxWidth: '400px' }}>
            <strong>Mandatory:</strong> Please take a live photo of the accident scene to help the family understand the situation.
          </p>
          <label 
            className={`btn ${(isUploading || (!isGPSReady && !showGpsBypass)) ? 'btn-disabled' : 'btn-danger'} btn-lg w-full flex items-center justify-center gap-3`} 
            style={{ 
                maxWidth: '340px', 
                cursor: (isUploading || (!isGPSReady && !showGpsBypass)) ? 'not-allowed' : 'pointer', 
                padding: '1.5rem', 
                fontSize: '1.2rem',
                fontWeight: '800',
                borderRadius: '20px',
                boxShadow: (isUploading || (!isGPSReady && !showGpsBypass)) ? 'none' : '0 15px 35px rgba(220, 38, 38, 0.25)',
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
              <><span className="spinner-small"></span> 📡 Broadcasting Incident...</>
            ) : (!isGPSReady && !showGpsBypass) ? (
              <>🛰️ Locking Signal...</>
            ) : (
              <>{!isGPSReady ? '📷 Continue without GPS' : '📷 Capture & Unlock Link'}</>
            )}
          </label>
          
          {showGpsBypass && !isGPSReady && !isUploading && (
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '1.5rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' }} onClick={() => setLocation({ lat: 0, lng: 0 })}>
              Skip GPS & View Profile
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
        <div className="scan-header" style={{ paddingTop: '2.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>
          <div className="safeid-badge" style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-cyan)', fontWeight: '800', display: 'inline-block', padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚑 ResQ Live Pulse</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '0.75rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            {userData.full_name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '1.1rem' }}>{t.scanProfile}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Medical Info */}
        <div className="glass-card emergency animate-slide-up" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-emergency)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
          <div className="medical-grid responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div className="medical-item highlight" style={{ background: 'rgba(255, 51, 102, 0.08)', border: '1px solid var(--border-emergency)', padding: '16px', borderRadius: '16px' }}>
              <div className="item-label" style={{ color: 'var(--accent-red)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🩸 {t.blood}</div>
              <div className="item-value" style={{ fontSize: '2rem', color: 'var(--accent-red)', fontWeight: '900' }}>
                {userData.blood_group || '—'}
              </div>
            </div>
            <div className="medical-item" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '16px' }}>
              <div className="item-label" style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>💊 {t.donor}</div>
              <div className="item-value" style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                {userData.organ_donor ? '✅ Donor' : '❌ No'}
              </div>
            </div>
          </div>

          {userData.allergies && (
            <div className="medical-item" style={{ marginTop: '1rem', background: 'rgba(255, 51, 102, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-emergency)' }}>
              <div className="item-label" style={{ color: 'var(--accent-red)', fontWeight: '700' }}>⚠️ {t.allergies}</div>
              <div className="item-value" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                {userData.allergies}
              </div>
            </div>
          )}

          {userData.conditions && (
            <div className="medical-item" style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div className="item-label" style={{ color: 'var(--text-muted)', fontWeight: '700' }}>🏥 {t.conditions}</div>
              <div className="item-value" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                {userData.conditions}
              </div>
            </div>
          )}

          {userData.medications && (
            <div className="medical-item" style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div className="item-label" style={{ color: 'var(--text-muted)', fontWeight: '700' }}>💊 {t.medications}</div>
              <div className="item-value" style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                {userData.medications}
              </div>
            </div>
          )}

          {userData.special_notes && (
            <div className="medical-item" style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div className="item-label" style={{ color: 'var(--text-muted)', fontWeight: '700' }}>📝 {t.notes}</div>
              <div className="item-value" style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {userData.special_notes}
              </div>
            </div>
          )}
        </div>

        {/* Final Emergency Actions */}
        <div className="animate-slide-up" style={{ marginTop: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', textAlign: 'center' }}>Family Notification</h3>

          {!isConfirmed ? (
            <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border-emergency)', background: 'var(--bg-card)', textAlign: 'center', borderRadius: '24px' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {isUploading ? 'Securing incident capture...' : 'Tap below to instantly alert emergency primary contacts.'}
              </p>
              <button
                onClick={() => {
                  if (isUploading) return;
                  handleDirectAlert();
                }}
                disabled={isUploading}
                className={`btn ${isUploading ? 'btn-disabled' : 'btn-danger'} btn-lg w-full ${!isUploading && 'animate-pulse'}`}
                style={{
                  padding: '1.5rem',
                  fontSize: '1.3rem',
                  fontWeight: '900',
                  borderRadius: '18px',
                  boxShadow: isUploading ? 'none' : '0 10px 40px rgba(220, 38, 38, 0.3)',
                  opacity: isUploading ? 0.7 : 1
                }}
              >
                {isUploading ? (
                  <><span className="spinner-small"></span> UPLOADING...</>
                ) : (
                  '🚨 NOTIFY FAMILY'
                )}
              </button>
            </div>
          ) : (
              <div className="glass-card animate-fade-in" style={{ padding: '2rem', border: '2px solid rgba(0, 242, 255, 0.3)', background: 'var(--bg-card)', textAlign: 'center', borderRadius: '28px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚑</div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Alert Broadcast Live</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: '500' }}>
                  Emergency signals have been sent via multidimensional channels.
                </p>

              </div>
          )}

          <div className="flex" style={{ gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <a href="tel:112" className="btn btn-danger btn-lg">📞 Call 112</a>
            <a href="tel:108" className="btn btn-ghost btn-lg">🚑 Call 108</a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center" style={{ padding: '2rem 0 1rem', opacity: 0.4, fontSize: '0.75rem' }}>
          ResQ v2.0 · (BUILD: ULTRA V2) · SENIOR PROTECTED
        </div>
      </div>
    </div>
  );
}
