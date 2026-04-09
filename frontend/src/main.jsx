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
      .then(registration => {
        console.log('🚀 Service Worker: Registered successfully with scope:', registration.scope);
      })
      .catch(error => {
        console.error('❌ Service Worker: Registration failed:', error);
      });
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
