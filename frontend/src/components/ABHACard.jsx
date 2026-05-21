import React from 'react';
import { Shield, Activity, Fingerprint, QrCode, CheckCircle2 } from 'lucide-react';

export default function ABHACard({ abhaId, fullName, gender, dob, verified }) {
  const cardBorder = verified
    ? '1px solid rgba(34, 211, 238, 0.6)'
    : '1px solid rgba(255, 255, 255, 0.1)';
    
  const cardShadow = verified
    ? '0 0 25px rgba(34, 211, 238, 0.3), 0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)'
    : '0 10px 20px rgba(0,0,0,0.3)';

  const cardFilter = verified
    ? 'none'
    : 'grayscale(0.85) opacity(0.65)';

  return (
    <div className="abha-card-container" style={{
      width: '100%',
      maxWidth: '400px',
      height: '240px',
      margin: '0 auto',
      perspective: '1000px',
      transition: 'all 0.5s ease'
    }}>
      <div className="abha-card-inner glass-card" style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: cardBorder,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: cardShadow,
        filter: cardFilter,
        overflow: 'hidden',
        transition: 'all 0.5s ease'
      }}>
        {/* Decorative Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '150px',
          height: '150px',
          background: verified 
            ? 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          zIndex: 0,
          transition: 'all 0.5s ease'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '150px',
          height: '150px',
          background: verified
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
          zIndex: 0,
          transition: 'all 0.5s ease'
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              background: verified ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.2)', 
              padding: '6px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.5s ease'
            }}>
              <Shield size={18} color="#0f172a" />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>ABHA</h2>
              <p style={{ fontSize: '0.6rem', margin: 0, color: verified ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', transition: 'all 0.5s ease' }}>Health ID Architecture</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {verified ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(34, 211, 238, 0.15)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                padding: '4px 8px',
                borderRadius: '999px',
                fontSize: '0.6rem',
                fontWeight: '800',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.2)'
              }}>
                <CheckCircle2 size={10} /> Verified
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 8px',
                borderRadius: '999px',
                fontSize: '0.6rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Unlinked
              </div>
            )}
            <Activity size={20} className={verified ? "text-cyan-400 animate-pulse" : "text-cyan-400 opacity-50"} />
          </div>
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
