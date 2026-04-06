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
  const [step, setStep] = useState('request-photo'); // INSTANT PHOTO FLOW
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [alertResult, setAlertResult] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

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
    
    return () => navigator.geolocation.clearWatch(watchId);
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




  const handleSkipLocation = () => {
    setStep('request-photo');
  };

  // Heartbeat Effect: Push live coordinates to backend
  useEffect(() => {
    if (activeAlertId && location) {
      const timer = setTimeout(async () => {
        const formData = new FormData();
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
        try { await alertAPI.liveUpdate(activeAlertId, formData); } 
        catch (err) { console.error('Heartbeat failed:', err); }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location, activeAlertId]);

  // Handle Photo Submission (MANDATORY PRO FLOW)
  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('latitude', location?.lat || 0);
    formData.append('longitude', location?.lng || 0);
    formData.append('photo', file);

    try {
      // Use the pre-configured alertAPI to avoid URL issues
      const res = await alertAPI.reportIncident(formData);
      setAlertResult(res.data);
      setActiveAlertId(res.data.alert_id);
      setStep('info'); // Reveal profile
    } catch (err) {
      console.error("Incident report failed (Silent Mode):", err);
      // Removed Error Banner for a cleaner UI
      setStep('info'); // Reveal anyway for rescuer access
    } finally {
      setIsUploading(false);
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
    return (
      <div className="scan-page">
        <div className="loading-overlay" style={{ minHeight: '100vh', padding: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>📸</div>
          <h2>Accident Evidence</h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <strong>Mandatory:</strong> Please take a live photo of the accident scene to help the family understand the situation.
          </p>
          <label className={`btn ${isUploading ? 'btn-disabled' : 'btn-danger'} btn-lg w-full flex items-center justify-center gap-2`} style={{ maxWidth: '300px', cursor: 'pointer', padding: '1.25rem', fontSize: '1.1rem' }}>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handlePhotoCapture} 
              disabled={isUploading}
              style={{ display: 'none' }} 
            />
            {isUploading ? (
              <><span className="spinner-small"></span> 📡 Uploading Incident Report...</>
            ) : (
              <>📷 Capture & Unlock Profile</>
            )}
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
               <div className="glass-card" style={{ padding: '1.5rem', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                     Please slide below to confirm and broadcast the emergency alert to the family.
                  </p>
                  <ConfirmSlider onConfirm={() => {
                     console.log("SOS TRIGGERED - ULTRA MODE ACTIVE");
                     setIsConfirmed(true);
                     setTimeout(() => {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                     }, 150);
                  }} text="Slide to Notify Family" />
               </div>
            ) : (
               <div className="glass-card animate-fade-in" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div className="flex flex-col" style={{ gap: '1rem' }}>
                     {(alertResult?.contacts_list || userData?.emergency_contacts || [])?.map((contact, idx) => (
                          <div key={idx} className="flex flex-col" style={{ gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <div style={{ fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.9 }}>Contact: {contact.name}</div>
                             <div className="flex" style={{ gap: '0.5rem' }}>
                                <a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(alertResult?.sos_message || `🚨 EMERGENCY ALERT: I have found your relative ${userData.full_name}. Here is the location: https://www.google.com/maps?q=${location?.lat},${location?.lng}`)}`} 
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="btn flex-1" style={{ backgroundColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem' }}>
                                   <span style={{ fontSize: '1.2rem' }}>💬</span> WhatsApp
                                </a>
                             </div>
                          </div>
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
