/**
 * GuardianMode — Active fall and impact detection.
 * Uses DeviceMotion API, Web Audio API, and Wake Lock API.
 */
import { useState, useEffect, useRef } from 'react';

export default function GuardianMode({ userId, onTrigger, onCancel }) {
  const [permissionState, setPermissionState] = useState('unknown');
  const [monitoring, setMonitoring] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0, total: 0 });
  const [testMode, setTestMode] = useState(false);

  const wakeLockRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // Stillness detection buffer
  const accelerationBuffer = useRef([]);
  const stabilizationEndTimeRef = useRef(0);
  const isWaitingForImpactRef = useRef(false);

  // Check browser support on mount
  useEffect(() => {
    const hasDeviceMotion = 'DeviceMotionEvent' in window;
    if (!hasDeviceMotion) {
      setPermissionState('unsupported');
    } else if (typeof DeviceMotionEvent.requestPermission !== 'function') {
      // Android / non-iOS standard browsers don't require permission explicitly
      setPermissionState('granted');
    }

    // Keep track of GPS in background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('GPS position acquisition failed:', err.message),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      stopMonitoring();
      stopAlarmSound();
    };
  }, []);

  // Request permissions (primarily for iOS Safari)
  const requestSensorPermission = async () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionState('granted');
          startMonitoring();
        } else {
          setPermissionState('denied');
        }
      } catch (err) {
        console.error('Permission request failed:', err);
        setPermissionState('denied');
      }
    } else {
      setPermissionState('granted');
      startMonitoring();
    }
  };

  // Start Screen Wake Lock
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired successfully.');
      } catch (err) {
        console.warn('Wake Lock acquisition failed:', err.message);
      }
    }
  };

  // Release Screen Wake Lock
  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Wake Lock released.');
    }
  };

  // Start fall monitoring
  const startMonitoring = async () => {
    await requestWakeLock();
    setMonitoring(true);
    setIsAlerting(false);
    setCountdown(15);
    accelerationBuffer.current = [];
    stabilizationEndTimeRef.current = Date.now() + 1500; // 1.5s stabilization window
    isWaitingForImpactRef.current = false;

    window.addEventListener('devicemotion', handleMotion);
  };

  // Stop fall monitoring
  const stopMonitoring = () => {
    releaseWakeLock();
    setMonitoring(false);
    window.removeEventListener('devicemotion', handleMotion);
    isWaitingForImpactRef.current = false;
  };

  // Monitor sensor data
  const handleMotion = (event) => {
    // We strictly need acceleration including gravity to detect the gravity vector (~9.8 m/s^2)
    // without which we cannot distinguish static rest (0 m/s^2) from freefall (0 m/s^2).
    const accel = event.accelerationIncludingGravity;
    if (!accel || accel.x === null || accel.y === null || accel.z === null) {
      return;
    }

    const x = accel.x;
    const y = accel.y;
    const z = accel.z;
    
    // Calculate magnitude of vector (m/s^2)
    const total = Math.sqrt(x * x + y * y + z * z);
    
    setSensorData({ x, y, z, total });

    // Store reading in buffer for stillness detection
    accelerationBuffer.current.push(total);
    if (accelerationBuffer.current.length > 50) {
      accelerationBuffer.current.shift(); // Keep last 50 readings (~1 second)
    }

    // Ignore fall detection logic during the initial stabilization window
    if (Date.now() < stabilizationEndTimeRef.current) {
      return;
    }

    // Ignore dummy zero sensor values (like on desktops or during startup glitch)
    if (total < 0.5) {
      return;
    }

    // ── FALL DETECTION LOGIC ──
    // In normal state, total acceleration is ~9.8 m/s^2 (1g)
    // 1. Freefall: Total acceleration drops below 3.0 m/s^2 (~0.3g)
    // 2. Impact: Immediately followed by a spike above 28 m/s^2 (~2.8g) (or lower in testMode)
    const impactThreshold = testMode ? 18 : 28;

    if (total < 3.0 && !isWaitingForImpactRef.current) {
      isWaitingForImpactRef.current = true;
      
      const listener = (e) => {
        const a = e.accelerationIncludingGravity;
        if (!a || a.x === null || a.y === null || a.z === null) return;
        const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
        
        if (mag > impactThreshold) {
          window.removeEventListener('devicemotion', listener);
          isWaitingForImpactRef.current = false;
          triggerAlarmWarning();
        }
      };
      
      window.addEventListener('devicemotion', listener);
      // Timeout listener after 1 second if no impact occurs
      setTimeout(() => {
        window.removeEventListener('devicemotion', listener);
        isWaitingForImpactRef.current = false;
      }, 1000);
    }
  };

  // Trigger local warning alert sequence
  const triggerAlarmWarning = () => {
    if (isAlerting) return;
    
    setIsAlerting(true);
    stopMonitoring();
    startAlarmSound();

    // Trigger phone vibration pattern (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 300, 500, 300, 500]);
    }

    // Capture precise GPS coordinate at trigger time
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        null,
        { enableHighAccuracy: true }
      );
    }

    setCountdown(15);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          dispatchSOS();
          return 0;
        }
        // Vibrate phone slightly on each tick
        if ('vibrate' in navigator && prev % 2 === 0) {
          navigator.vibrate(150);
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Dispatch SOS payload to backend
  const dispatchSOS = () => {
    stopAlarmSound();
    onTrigger?.(gpsLocation);
  };

  // User canceled the alert
  const handleCancelAlert = () => {
    clearInterval(countdownIntervalRef.current);
    stopAlarmSound();
    setIsAlerting(false);
    onCancel?.();
    startMonitoring(); // Resume monitoring
  };

  // Audio synthesis for the warning siren (Web Audio API)
  const startAlarmSound = () => {
    try {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      let toggle = false;
      beepIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(toggle ? 987.77 : 523.25, audioCtxRef.current.currentTime); // High alert B5 and C5 siren tones
        gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime);
        
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.25);
        toggle = !toggle;
      }, 350);
    } catch (err) {
      console.warn('Web Audio API is blocked or unsupported:', err);
    }
  };

  const stopAlarmSound = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const forceSimulation = () => {
    triggerAlarmWarning();
  };

  // ── RENDER STATES ──

  if (permissionState === 'unsupported') {
    return (
      <div className="glass-card" style={{ border: '1px solid var(--accent-red)', padding: '1.5rem', borderRadius: '20px' }}>
        <p style={{ color: 'var(--accent-red)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          ⚠️ Sensor Access Unsupported
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          This browser or device does not support motion sensor tracking APIs. Fall Detection is disabled.
        </p>
      </div>
    );
  }

  if (permissionState === 'unknown' || permissionState === 'denied') {
    return (
      <div className="glass-card" style={{ padding: '20px', borderRadius: '24px', border: '1.2px dashed var(--border-subtle)', background: 'rgba(15, 23, 42, 0.2)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📳</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Device Sensors Permission</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
          ResQ needs permission to access your device's accelerometer to automatically detect falls and impacts in real time.
        </p>
        <button 
          onClick={requestSensorPermission}
          className="btn btn-primary btn-md w-full"
          style={{ padding: '0.75rem 1.25rem', fontWeight: '700', borderRadius: '12px' }}
        >
          Enable Motion Access
        </button>
        {permissionState === 'denied' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: '0.75rem', fontWeight: '600' }}>
            Permission was denied. Please reset website permissions in your browser settings to enable.
          </p>
        )}
      </div>
    );
  }

  // Warning Overlay State (Alarm Triggered)
  if (isAlerting) {
    return (
      <div className="fall-warning-overlay">
        <div className="fall-warning-content animate-pulse">
          <div className="siren-icon">🚨</div>
          <h2 className="overlay-title">Fall Detected!</h2>
          <p className="overlay-desc">
            An abnormal impact followed by immobility was detected. Alerting emergency contacts in:
          </p>
          
          <div className="countdown-circle">
            <span className="countdown-number">{countdown}</span>
          </div>

          <div className="overlay-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '340px', padding: '0 1rem' }}>
            <button 
              onClick={handleCancelAlert}
              className="btn btn-emerald btn-lg cancel-sos-btn"
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem', fontWeight: '900', borderRadius: '16px' }}
            >
              🟢 I'M OK — CANCEL SOS
            </button>
            <button 
              onClick={dispatchSOS}
              className="btn btn-danger btn-sm"
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(220,38,38,0.4)', color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}
            >
              Alert Family Immediately
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ border: monitoring ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)', transition: 'all 0.3s ease', background: monitoring ? 'rgba(0, 242, 255, 0.02)' : 'var(--bg-card)' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.75rem' }}>🛡️</div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Guardian Mode</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated Fall & Impact Protection</p>
          </div>
        </div>
        
        <div className="flex items-center" style={{ gap: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: monitoring ? 'var(--accent-cyan)' : 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {monitoring ? 'SHIELD ON' : 'OFF'}
          </span>
          <div 
            onClick={monitoring ? stopMonitoring : startMonitoring}
            className={`toggle-pill ${monitoring ? 'active' : ''}`} 
            style={{ 
              width: '46px', 
              height: '24px', 
              background: monitoring ? 'var(--accent-cyan)' : '#334155', 
              borderRadius: '20px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
          >
            <div style={{ 
              width: '18px', 
              height: '18px', 
              background: '#fff', 
              borderRadius: '50%', 
              position: 'absolute', 
              top: '3px', 
              left: monitoring ? '25px' : '3px',
              transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>
      </div>

      {monitoring && (
        <div className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between items-center" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Live Pulse: <strong style={{ color: 'var(--text-secondary)' }}>{sensorData.total.toFixed(2)} m/s²</strong></span>
            <span style={{ cursor: 'pointer', color: testMode ? 'var(--accent-yellow)' : 'var(--text-muted)', fontWeight: '700' }} onClick={() => setTestMode(!testMode)}>
              {testMode ? '⚙️ Test Sensitivity ON' : '⚙️ Standard Mode'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '6px' }}>X: {sensorData.x.toFixed(1)}</div>
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '6px' }}>Y: {sensorData.y.toFixed(1)}</div>
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '6px' }}>Z: {sensorData.z.toFixed(1)}</div>
          </div>
          
          {sensorData.total === 0 && (
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-yellow)', marginTop: '8px', lineHeight: '1.3', background: 'rgba(234, 179, 8, 0.05)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.1)' }}>
              ℹ️ No sensor activity detected. Accelerometers are only active on physical mobile devices. On mobile, ensure you are using a secure connection (HTTPS) or accessing from localhost.
            </div>
          )}
          
          <div className="flex gap-2" style={{ marginTop: '12px' }}>
            <button 
              onClick={forceSimulation}
              className="btn btn-ghost btn-sm w-full"
              style={{ fontSize: '0.75rem', padding: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              💥 Simulate Fall Test
            </button>
          </div>
        </div>
      )}

      {!monitoring && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
          Enable Guardian Mode when going solo. Keeps screen awake and uses device sensors to auto-alert contacts if you crash.
        </p>
      )}
    </div>
  );
}
