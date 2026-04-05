/**
 * SafeID — Entry Point
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for PWA (Offline & Installable)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('🛡️ SafeID Service Worker: Registered', reg))
      .catch(err => console.error('⚠️ SafeID Service Worker: Failed', err));
  });
}
