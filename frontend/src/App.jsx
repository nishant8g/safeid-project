/**
 * App.jsx — Router and main application layout.
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Contacts from './pages/Contacts';
import QRPage from './pages/QRPage';
import ScanPage from './pages/ScanPage';
import History from './pages/History';
import NFCPortal from './pages/NFCPortal';

import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔥 Critical Public Route — QR Scan (No Auth!) */}
          <Route path="/scan/:userId" element={<ScanPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/contacts" element={
            <ProtectedRoute><Contacts /></ProtectedRoute>
          } />
          <Route path="/qr" element={
            <ProtectedRoute><QRPage /></ProtectedRoute>
          } />
          <Route path="/nfc" element={
            <ProtectedRoute><NFCPortal /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><History /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="loading-overlay" style={{ minHeight: '80vh' }}>
              <div style={{ fontSize: '4rem' }}>🔍</div>
              <h2>Page Not Found</h2>
              <p className="text-muted">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Home</a>
            </div>
          } />
        </Routes>
      </Router>
      <Analytics />
    </AuthProvider>
  );
}
