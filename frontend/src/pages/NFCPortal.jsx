/**
 * NFC Portal — Program physical NFC tags with SafeID profiles.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';


export default function NFCPortal() {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle, scanning, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // The direct public link to their emergency profile
  const scanUrl = `${window.location.origin}/scan/${user?.id}`;

  const writeNfcTag = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('error');
      setErrorMessage('NFC is not supported on this device/browser. Please use Chrome on Android.');
      return;
    }

    try {
      setStatus('scanning');
      setErrorMessage('');

      // Create a new reader instance natively available in Chrome Android
      const ndef = new window.NDEFReader();
      
      // Request permission and activate the scanner
      await ndef.scan();
      
      // Wait for user to physically tap a tag, then write the URL
      await ndef.write({
        records: [{ recordType: 'url', data: scanUrl }]
      });

      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(`Failed to write to NFC tag: ${error.message || 'Tag disconnected'}`);
    }
  };

  return (
    <div className="page-container medium animate-fade-in">
      <div className="section-header text-center" style={{ marginBottom: '3rem' }}>
        <div className="section-tag">Smart Hardware</div>
        <h2 className="text-glow" style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>📡 Tap-to-Scan NFC</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>Program a physical NFC sticker with your SafeID. Rescuers can just tap their phone to your helmet to view your emergency profile!</p>
      </div>

      <div className="glass-card text-center" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', border: '1px solid rgba(255, 255, 255, 1)', boxShadow: 'var(--shadow-xl)' }}>
        
        {/* Animated NFC Icon */}
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: status === 'scanning' ? 'pulse 1.5s infinite' : 'none' }}>
          {status === 'success' ? '✅' : status === 'error' ? '❌' : '📳'}
        </div>

        {/* Status Text */}
        <h3 style={{ marginBottom: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          {status === 'idle' && 'Ready to Program'}
          {status === 'scanning' && 'Hold NFC Tag near Phone...'}
          {status === 'success' && 'Successfully Programmed!'}
          {status === 'error' && 'Programming Failed'}
        </h3>

        {errorMessage && (
          <div className="alert alert-error text-left" style={{ marginBottom: '1.5rem' }}>
            {errorMessage}
          </div>
        )}

        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--border-subtle)', wordBreak: 'break-all', backdropFilter: 'blur(10px)' }}>
          <small style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target URL Payload:</small>
          <code style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.9rem', textShadow: '0 0 10px rgba(0, 242, 255, 0.3)' }}>{scanUrl}</code>
        </div>

        {/* Action Button */}
        <button 
          className="btn btn-primary btn-lg btn-full"
          onClick={writeNfcTag}
          disabled={status === 'scanning'}
          style={{ padding: '1.25rem', borderRadius: '16px', fontSize: '1.2rem', fontWeight: '800', boxShadow: '0 10px 30px rgba(0, 97, 255, 0.25)' }}
        >
          {status === 'scanning' ? 'Scanning...' : '⚡ Write to NFC Tag'}
        </button>

        {/* Instructions */}
        <div className="text-left" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: '800' }}>Protocol Instructions:</h4>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8', fontWeight: '500' }}>
            <li>Purchase a blank <strong>NTAG215</strong> or NTAG213 sticker.</li>
            <li>Click the <strong>Write to NFC Tag</strong> button above.</li>
            <li>Hold the sticker to the back of your phone (near the camera).</li>
            <li>Apply it to your helmet, ID badge, or profile carrier!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
