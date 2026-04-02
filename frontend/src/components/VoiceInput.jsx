/**
 * VoiceInput — Hands-free voice command for emergency.
 * Uses Web Speech API to recognize "send help", "emergency", etc.
 */
import { useState, useRef, useEffect } from 'react';

export default function VoiceInput({ onTranscript, onTriggerWord }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const triggerWords = ['send help', 'emergency', 'notify', 'help me', 'sos', 'call help'];

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
        .toLowerCase();
      setTranscript(text);
      onTranscript?.(text);

      // Check for trigger words
      const triggered = triggerWords.some((word) => text.includes(word));
      if (triggered && event.results[0].isFinal) {
        onTriggerWord?.(text);
        setListening(false);
      }
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser.');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="flex flex-col items-center" style={{ gap: '0.75rem' }}>
      <button
        className={`voice-btn ${listening ? 'recording' : ''}`}
        onClick={toggleListening}
        title={listening ? 'Stop listening' : 'Start voice command'}
      >
        🎤
      </button>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {listening ? (
          <span style={{ color: 'var(--accent-red)' }}>Listening... Say "Send Help"</span>
        ) : (
          'Tap to speak'
        )}
      </p>
      {transcript && (
        <div style={{
          padding: '0.5rem 1rem',
          background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          maxWidth: '300px',
          textAlign: 'center',
        }}>
          "{transcript}"
        </div>
      )}
    </div>
  );
}
