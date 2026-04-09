/**
 * SafeID — Entry Point
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force clear any old service workers causing hangs (Rollback)
// Register Service Worker for PWA (Get App functionality)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('🚀 Service Worker Registered!', reg))
      .catch(err => console.log('❌ Service Worker Registration Failed', err));
  });
}

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="963876569237-9osij8medcclsjr52ehr7mb4vs2fluq7.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
