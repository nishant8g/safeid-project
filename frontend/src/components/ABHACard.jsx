import React from 'react';
import { Shield, Activity, Fingerprint, QrCode } from 'lucide-react';

export default function ABHACard({ abhaId, fullName, gender, dob }) {
  return (
    <div className="abha-card-container" style={{
      width: '100%',
      maxWidth: '400px',
      height: '240px',
      margin: '0 auto',
      perspective: '1000px'
    }}>
      <div className="abha-card-inner glass-card" style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              background: 'var(--accent-cyan)', 
              padding: '6px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} color="#0f172a" />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>ABHA</h2>
              <p style={{ fontSize: '0.6rem', margin: 0, color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>Health ID Architecture</p>
            </div>
          </div>
          <Activity size={20} className="text-cyan-400 opacity-50" />
        </div>

        {/* Center Content */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', zIndex: 1 }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            <Fingerprint size={48} className="text-cyan-400/30" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{fullName || 'RESQ USER'}</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', margin: '0 0 1px 0', textTransform: 'uppercase' }}>Gender</p>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', margin: 0 }}>{gender || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', margin: '0 0 1px 0', textTransform: 'uppercase' }}>DOB</p>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', margin: 0 }}>{dob || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'end',
          zIndex: 1,
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Health ID Number</p>
            <p style={{ 
              fontSize: '1.1rem', 
              fontWeight: '900', 
              color: 'var(--accent-cyan)', 
              margin: 0, 
              fontFamily: 'monospace',
              letterSpacing: '0.1em'
            }}>{abhaId || 'XX-XXXX-XXXX-XXXX'}</p>
          </div>
          <div style={{
            background: 'white',
            padding: '4px',
            borderRadius: '6px',
            opacity: 0.8
          }}>
            <QrCode size={32} color="#0f172a" />
          </div>
        </div>
      </div>
    </div>
  );
}
