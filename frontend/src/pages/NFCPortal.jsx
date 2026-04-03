/**
 * NFC Portal — Program physical NFC tags with SafeID profiles.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { qrAPI } from '../api/client'; // Uses the same base URL resolver

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
      <div className="section-header text-center">
        <div className="section-tag" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>Advanced Feature</div>
        <h2>📡 Tap-to-Scan NFC</h2>
        <p>Program a physical NFC sticker with your SafeID. Rescuers can just tap their phone to your helmet to view your emergency profile!</p>
      </div>

      <div className="glass-card text-center" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Animated NFC Icon */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: status === 'scanning' ? 'pulse 1.5s infinite' : 'none' }}>
          {status === 'success' ? '✅' : status === 'error' ? '❌' : '📳'}
        </div>

        {/* Status Text */}
        <h3 style={{ marginBottom: '1rem' }}>
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

        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', wordBreak: 'break-all' }}>
          <small className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>URL to be written:</small>
          <code style={{ color: 'var(--accent-blue)' }}>{scanUrl}</code>
        </div>

        {/* Action Button */}
        <button 
          className="btn btn-primary btn-lg btn-full"
          onClick={writeNfcTag}
          disabled={status === 'scanning'}
        >
          {status === 'scanning' ? 'Scanning...' : '⚡ Write to NFC Tag'}
        </button>

        {/* Instructions */}
        <div className="text-left" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>How it works:</h4>
          <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <li>Purchase a blank <strong>NTAG215</strong> or NTAG213 sticker from Amazon.</li>
            <li>Click the blue Write button above.</li>
            <li>Hold the blank sticker to the back of your phone (usually near the top camera).</li>
            <li>Stick it to your helmet, ID badge, or phone case!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
